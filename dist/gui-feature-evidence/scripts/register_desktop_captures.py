#!/usr/bin/env python3
import datetime,hashlib,json,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
entries=[
('widgets','linux-tray-menu','Native Linux tray menu',['F24.S01','F24.S03','F24.S04']),
('widgets','linux-tray-hidden','Node remains accessible with its window hidden',['F24.S01','F24.S02','F26.S03']),
('widgets','linux-payment-notification','Incoming payment delivered to the desktop',['F25.S01','F25.S02']),
('qml','linux-tray-menu','Native Linux tray menu',['F24.S01','F24.S04']),
('qml','linux-tray-hidden','QML window hidden while the node keeps running',['F24.S01','F24.S02','F26.S03']),
]
for app,stem,caption,features in entries:
 p=ROOT/'media'/app/(stem+'.png')
 data=p.read_bytes();width,height=struct.unpack('>II',data[16:24])
 item={'path':str(p.relative_to(ROOT)),'caption':caption,'features':features,'kind':'desktop-screenshot','utc':datetime.datetime.fromtimestamp(p.stat().st_mtime,datetime.timezone.utc).isoformat(),'width':width,'height':height,'sha256':hashlib.sha256(data).hexdigest()}
 path=ROOT/'media'/app/'captures.json'
 rows=json.loads(path.read_text()) if path.exists() else []
 rows=[r for r in rows if r['path']!=item['path']]+[item]
 path.write_text(json.dumps(rows,indent=2)+'\n')
# Assertions made directly against process exit/service output, separate from GUI setup.
p=ROOT/'logs/widgets-checks.json';rows=json.loads(p.read_text())
for identifier,features,description,actual,expected in [
 ('native-tray-quit',['F24.S04','F27.S05'],'Native Linux tray Exit terminates the Widgets process successfully.',int((ROOT/'logs/widgets-notification-app.exit').read_text()),0),
 ('desktop-notification-delivered',['F25.S01','F25.S02'],'The desktop service receives the application notification with amount, wallet and label.',all(s in (ROOT/'logs/widgets-notifications.log').read_text() for s in ['Bitcoin Core - Incoming transaction','+0.12500000 BTC','Wallet: Acceptance wallet','Label: Notification evidence']),True),
 ('wallet-disabled-clean-exit',['F27.S05','F33.S03'],'The wallet-disabled Widgets process shuts down successfully.',int((ROOT/'logs/widgets-node-only-app.exit').read_text()),0),
]:
 item={'id':identifier,'features':features,'description':description,'actual':actual,'expected':expected,'status':'passed' if actual==expected else 'failed'}
 rows=[r for r in rows if r['id']!=identifier]+[item]
p.write_text(json.dumps(rows,indent=2)+'\n')
