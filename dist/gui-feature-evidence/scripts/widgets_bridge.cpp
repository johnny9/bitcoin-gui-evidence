// External, test-only driver for the unmodified dynamically linked Qt Widgets GUI.
// Loaded with LD_PRELOAD in an isolated regtest instance. Never use on real funds.
#include <QtWidgets>
#include <QtNetwork/QLocalServer>
#include <QtNetwork/QLocalSocket>
#include <QtTest/QTest>
#include <dlfcn.h>

static QHash<int, QPointer<QObject>> objects;
static int next_id = 1;
static int id_for(QObject* o) {
    for (auto it = objects.begin(); it != objects.end(); ++it) if (it.value() == o) return it.key();
    int id = next_id++; objects[id] = o; return id;
}
static QObject* target(const QJsonObject& c) {
    if (c.contains("id")) return objects.value(c["id"].toInt());
    QString name = c["name"].toString();
    for (QWidget* w : QApplication::allWidgets()) {
        if (w->objectName() == name) return w;
        for (QObject* o : w->findChildren<QObject*>(name)) return o;
    }
    return nullptr;
}
static QJsonObject describe(QObject* o) {
    QJsonObject r{{"id", id_for(o)}, {"name", o->objectName()}, {"class", o->metaObject()->className()}};
    if (auto w = qobject_cast<QWidget*>(o)) {
        r["visible"] = w->isVisible(); r["enabled"] = w->isEnabled(); r["title"] = w->windowTitle();
        QPoint p = w->mapToGlobal(QPoint(0,0));
        r["geometry"] = QJsonArray{p.x(),p.y(),w->width(),w->height()};
        r["window"] = id_for(w->window());
    }
    for (auto key : {"text", "plainText", "checked", "currentText", "value", "toolTip", "statusTip"}) {
        QVariant v = o->property(key); if (v.isValid()) r[key] = QJsonValue::fromVariant(v);
    }
    return r;
}
static QJsonObject command(const QJsonObject& c) {
    QString cmd = c["cmd"].toString();
    if (cmd == "tree") {
        QJsonArray a; QSet<QObject*> seen;
        for (auto w : QApplication::allWidgets()) {
            if (!c["all"].toBool() && !w->isVisible()) continue;
            a.append(describe(w)); seen.insert(w);
            for (auto action : w->findChildren<QAction*>()) if (!seen.contains(action)) {a.append(describe(action)); seen.insert(action);}
        }
        return {{"objects", a}};
    }
    if (cmd == "clipboard") return {{"text", QApplication::clipboard()->text()}, {"hasImage", !QApplication::clipboard()->image().isNull()}};
    if (cmd == "setClipboard") { QApplication::clipboard()->setText(c["text"].toString()); return {{"ok",true}}; }
    QObject* o = target(c);
    if (!o) return {{"error","Object not found"}};
    if (cmd == "get") return {{"value", QJsonValue::fromVariant(o->property(c["property"].toString().toUtf8()))}};
    if (cmd == "set") { bool ok = o->setProperty(c["property"].toString().toUtf8(), c["value"].toVariant()); return {{"ok",ok}}; }
    if (cmd == "text") {
        QString text = c["text"].toString();
        if (auto e = qobject_cast<QLineEdit*>(o)) { e->setFocus(); QTest::keyClick(e,Qt::Key_A,Qt::ControlModifier); QTest::keyClicks(e,text); }
        else if (auto e = qobject_cast<QPlainTextEdit*>(o)) e->setPlainText(text);
        else if (auto e = qobject_cast<QTextEdit*>(o)) e->setPlainText(text);
        else return {{"error","Not an editable text field"}};
        return {{"ok",true}};
    }
    if (cmd == "capture") {
        auto w = qobject_cast<QWidget*>(o); if (!w) return {{"error","Not a widget"}};
        return {{"ok",w->grab().save(c["path"].toString())}};
    }
    if (cmd == "click" || cmd == "action" || cmd == "key" || cmd == "close" || cmd == "show") {
        QPointer<QObject> p(o);
        QTimer::singleShot(0, qApp, [p,c,cmd] {
            if (!p) return;
            auto w = qobject_cast<QWidget*>(p.data());
            if (cmd == "action") { if(auto a=qobject_cast<QAction*>(p.data())) a->trigger(); }
            if (cmd == "click" && w) QTest::mouseClick(w, Qt::LeftButton, Qt::NoModifier, w->rect().center());
            if (cmd == "key" && w) { w->setFocus(); QTest::keyClick(w, static_cast<Qt::Key>(c["key"].toInt()), static_cast<Qt::KeyboardModifiers>(c["modifiers"].toInt())); }
            if (cmd == "close" && w) w->close();
            if (cmd == "show" && w) { w->showNormal(); w->raise(); w->activateWindow(); }
        });
        return {{"ok",true}, {"scheduled",true}};
    }
    if (cmd == "combo") {
        if(auto box=qobject_cast<QComboBox*>(o)) { box->setCurrentIndex(c["index"].toInt()); return {{"ok",true}}; }
    }
    return {{"error","Unknown command"}};
}
extern "C" int _ZN16QCoreApplication4execEv() {
    using Exec = int(*)();
    static Exec original = reinterpret_cast<Exec>(dlsym(RTLD_NEXT,"_ZN16QCoreApplication4execEv"));
    const QString path = qEnvironmentVariable("WIDGETS_EVIDENCE_SOCKET");
    if (!path.isEmpty()) {
        auto server = new QLocalServer(qApp); QLocalServer::removeServer(path);
        QObject::connect(server,&QLocalServer::newConnection,server,[server] {
            while (server->hasPendingConnections()) {
                auto socket=server->nextPendingConnection();
                QObject::connect(socket,&QLocalSocket::readyRead,socket,[socket] {
                    while (socket->canReadLine()) {
                        auto doc=QJsonDocument::fromJson(socket->readLine());
                        auto response=command(doc.object());
                        socket->write(QJsonDocument(response).toJson(QJsonDocument::Compact)+"\n"); socket->flush();
                    }
                });
                QObject::connect(socket,&QLocalSocket::disconnected,socket,&QObject::deleteLater);
            }
        });
        if (!server->listen(path)) qWarning() << "Evidence bridge failed:" << server->errorString();
    }
    return original();
}
