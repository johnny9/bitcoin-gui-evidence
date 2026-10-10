// Test-only external application: receives real drags and desktop file/URL opens.
#include <QtWidgets>
#include <QMimeData>
#include <QFile>
#include <QJsonDocument>
#include <QJsonObject>
class DropTarget : public QLabel {
public:
    DropTarget(){setText("Drop a QR image here\nExternal application test fixture");setAlignment(Qt::AlignCenter);setAcceptDrops(true);setMinimumSize(360,400);}
    void dragEnterEvent(QDragEnterEvent* e) override {if(e->mimeData()->hasImage())e->acceptProposedAction();}
    void dropEvent(QDropEvent* e) override {
        QImage img=qvariant_cast<QImage>(e->mimeData()->imageData());
        if(img.isNull())return;
        QString root=qEnvironmentVariable("WIDGETS_PASS_ROOT");img.save(root+"/logs/dragged-qr.png");
        QFile f(root+"/logs/qr-drop.json");f.open(QIODevice::WriteOnly);f.write(QJsonDocument(QJsonObject{{"received",true},{"width",img.width()},{"height",img.height()}}).toJson());
        setPixmap(QPixmap::fromImage(img));e->acceptProposedAction();
    }
};
int main(int argc,char**argv){
    QApplication app(argc,argv);QString root=qEnvironmentVariable("WIDGETS_PASS_ROOT");
    if(argc==1){DropTarget target;target.setWindowTitle("QR drag receiver — test fixture");target.move(950,170);target.show();return app.exec();}
    QString target=QString::fromLocal8Bit(argv[1]);if(QUrl(target).isLocalFile())target=QUrl(target).toLocalFile();QFile log(root+"/logs/external-opens.jsonl");log.open(QIODevice::Append);log.write(QJsonDocument(QJsonObject{{"target",target}}).toJson(QJsonDocument::Compact)+"\n");log.flush();
    QWidget window;window.setWindowTitle("External document / URL viewer — test fixture");QVBoxLayout layout(&window);QLabel title(target);title.setWordWrap(true);layout.addWidget(&title);QPlainTextEdit content;content.setReadOnly(true);layout.addWidget(&content);
    QFile f(target);if(f.open(QIODevice::ReadOnly)){content.setPlainText(QString::fromUtf8(f.read(18000)));}else{content.setPlainText("External URL received from Bitcoin Core.\nThis recording fixture verifies URL dispatch; it does not contact a public block explorer.");}
    window.resize(1050,620);window.move(100,130);window.show();return app.exec();
}
