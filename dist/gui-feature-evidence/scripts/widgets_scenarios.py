#!/usr/bin/env python3
"""Regtest acceptance scenarios using actual Widgets controls and RPC oracles."""
import base64
import json
import os
import re
import subprocess
from pathlib import Path
import sys
import time
import urllib.request
from urllib.parse import quote, urlparse, parse_qs
from widgets_driver import Driver, ROOT

gui = Driver()
WALLET = 'Acceptance wallet'

def rpc(method, params=None, wallet=None, port=19443):
    url=f'http://127.0.0.1:{port}/' + (('wallet/'+quote(wallet)) if wallet else '')
    request=urllib.request.Request(url,json.dumps({'jsonrpc':'2.0','id':1,'method':method,'params':params or []}).encode())
    request.add_header('Authorization','Basic '+base64.b64encode(b'evidence:synthetic-test-only').decode())
    response=json.load(urllib.request.urlopen(request,timeout=30))
    if response.get('error'): raise RuntimeError(response['error'])
    return response['result']

def check(identifier, features, description, actual, expected=True):
    passed=actual==expected
    path=ROOT/'logs/widgets-checks.json'
    rows=json.loads(path.read_text()) if path.exists() else []
    item={'id':identifier,'features':features,'description':description,'actual':actual,'expected':expected,'status':'passed' if passed else 'failed'}
    rows=[r for r in rows if r['id']!=identifier]+[item]
    path.write_text(json.dumps(rows,indent=2)+'\n')
    print(json.dumps(item),flush=True)
    assert passed,description

def ok(): gui.click(cls='QPushButton',text='OK')

def select_wallet(name=WALLET):
    wallets=rpc('listwallets')
    box=next(o for o in gui.tree() if o['class']=='QComboBox' and o.get('currentText') in wallets)
    gui.send('set',id=box['id'],property='currentText',value=name)
    time.sleep(.3)

def preferences():
    select_wallet()
    gui.action('Options…'); gui.wait(cls='OptionsDialog')
    for index,label,features in [
        (0,'general',['F20.S02','F20.S03','F23.S01','F23.S02','F23.S11','F27.S01']),
        (1,'wallet',['F23.S03','F23.S04','F23.S05','F15.S01']),
        (2,'network',['F21.S02','F21.S03','F21.S04','F29.S03']),
        (3,'window',['F23.S09','F24.S05','F26.S03']),
        (4,'display',['F23.S06','F23.S07','F23.S08'])]:
        gui.set('tabWidget','currentIndex',index)
        gui.capture('preferences-'+label,cls='OptionsDialog',features=features)
    gui.set('tabWidget','currentIndex',1)
    for name in ('coinControlFeatures','m_enable_psbt_controls'):
        if not gui.get(name,'checked'):gui.click(name=name)
    ok()
    gui.action('Send')
    check('enable-coin-control',['F23.S05'],'Enabling advanced controls exposes input selection.',gui.find(name='pushButtonCoinControl')['visible'])
    gui.capture('send-coin-control',features=['F09.S01','F09.S02','F09.S04','F09.S05','F12.S08'])

def receive():
    select_wallet(); gui.action('Receive')
    gui.text('reqLabel','Acceptance payment');gui.text('reqMessage','Regtest payment request')
    # BitcoinAmountField forwards the public value property in satoshis.
    gui.set('reqAmount','value',125000000)
    gui.capture('receive-request-form',features=['F08.S01','F08.S02','F08.S07'])
    gui.click(name='receiveButton');gui.wait(cls='ReceiveRequestDialog')
    gui.capture('receive-payment-qr',cls='ReceiveRequestDialog',features=['F08.S02','F08.S03','F08.S04','F08.S05'])
    address=gui.get('address_content','text')
    gui.click(name='btnCopyAddress')
    check('receive-copy-address',['F08.S04'],'Copy address writes the generated address to the system clipboard.',gui.send('clipboard')['text'],address)
    gui.click(name='btnCopyURI');uri=gui.send('clipboard')['text']
    parsed=urlparse(uri);query=parse_qs(parsed.query)
    check('receive-copy-uri',['F08.S02','F08.S03','F08.S04'],'Copied BIP21 link includes address, amount, label and message.',[parsed.path.lower(),float(query.get('amount',['0'])[0]),query.get('label'),query.get('message')],[address.lower(),1.25,['Acceptance payment'],['Regtest payment request']])
    info=rpc('getaddressinfo',[address],WALLET)
    check('receive-owned-address',['F08.S01'],'Generated receiving address belongs to the selected wallet.',info['ismine'])
    gui.close('ReceiveRequestDialog')
    gui.capture('receive-saved-request',features=['F08.S07'])

def sign_message():
    select_wallet(); address=rpc('getnewaddress',['Message signing','legacy'],WALLET)
    gui.action('Sign message…');gui.wait(cls='SignVerifyMessageDialog')
    gui.text('addressIn_SM',address);gui.text('messageIn_SM','Acceptance evidence: regtest only.');gui.click(name='signMessageButton_SM')
    signature=gui.get('signatureOut_SM','text')
    check('sign-message',['F19.S01'],'GUI signature verifies through Core RPC.',rpc('verifymessage',[address,signature,'Acceptance evidence: regtest only.']))
    gui.capture('message-signed',cls='SignVerifyMessageDialog',features=['F19.S01','F19.S03'])
    gui.click(name='copySignatureButton_SM')
    check('copy-signature',['F19.S03'],'Signature is copied to the system clipboard.',gui.send('clipboard')['text'],signature)
    gui.set('tabWidget','currentIndex',1)
    gui.text('addressIn_VM',address);gui.text('messageIn_VM','Acceptance evidence: regtest only.');gui.text('signatureIn_VM',signature)
    gui.click(name='verifyMessageButton_VM')
    check('verify-message',['F19.S02'],'GUI reports valid message signature.',re.sub('<[^>]+>','',gui.get('statusLabel_VM','text')),'Message verified.')
    gui.capture('message-verified',cls='SignVerifyMessageDialog',features=['F19.S02'])
    gui.close('SignVerifyMessageDialog')

def shell():
    select_wallet();gui.action('Overview')
    gui.capture('overview-balances',features=['F07.S01','F07.S02','F26.S05','F29.S01','F29.S02'])
    mask=gui.find(cls='QAction',text='Mask values')
    if not gui.send('get',id=mask['id'],property='checked')['value']:gui.action('Mask values')
    check('privacy-values',['F07.S05','F32.S01'],'Balance text is masked in the overview.', '#' in str(gui.get('labelBalance','text')))
    gui.capture('privacy-masked-overview',features=['F07.S05','F32.S01','F32.S02'])
    history=gui.find(cls='QAction',text='Transactions')
    check('privacy-history-disabled',['F32.S02'],'Transaction history action is disabled while privacy is on.',gui.send('get',id=history['id'],property='enabled')['value'],False)
    gui.action('Mask values')
    gui.action('Node window');gui.wait(cls='RPCConsole')
    for action,label,features in [('Information','node-information',['F22.S01']),('Console','rpc-console',['F22.S05','F22.S06','F22.S07','F22.S08']),('Network Traffic','network-traffic',['F22.S02','F22.S03']),('Peers','peers',['F21.S05','F21.S06','F21.S07','F21.S08'])]:
        gui.action(action);gui.capture(label,cls='RPCConsole',features=features)
    gui.close('RPCConsole')
    gui.action('About Bitcoin Core');time.sleep(.3)
    for o in gui.tree():
        if o.get('title') and o['window']==o['id']:print(o,flush=True)

def inspect():
    for o in gui.tree():
        if o['class'] not in ('QAction','QLabel','QWidget','QFrame','QScrollBar','QBoxLayout','QHBoxLayout','QVBoxLayout'):print(o,flush=True)

def help_pages():
    gui.capture('about-application',cls='HelpMessageDialog',features=['F31.S06'])
    gui.close('HelpMessageDialog');gui.action('Command-line options');gui.wait(cls='HelpMessageDialog')
    gui.capture('command-line-help',cls='HelpMessageDialog',features=['F31.S06']);gui.close('HelpMessageDialog')

def file_save(path):
    gui.wait(cls='QFileDialog');gui.text('fileNameEdit',path);gui.click(cls='QPushButton',text='Save');time.sleep(.3)

def backups():
    select_wallet();Path('/work/backups').mkdir(exist_ok=True)
    path='/work/backups/acceptance-wallet.dat'
    gui.action('Backup Wallet…');gui.wait(cls='QFileDialog');gui.text('fileNameEdit',path)
    gui.capture('backup-wallet-file',cls='QFileDialog',features=['F03.S01']);gui.click(cls='QPushButton',text='Save');time.sleep(.5)
    check('backup-wallet-file',['F03.S01'],'The GUI writes a nonempty wallet backup file.',Path(path).is_file() and Path(path).stat().st_size>0)
    gui.action('Export watch-only wallet');gui.wait(cls='QFileDialog')
    path='/work/backups/watch-only.dat';gui.text('fileNameEdit',path)
    gui.capture('export-watch-only-wallet',cls='QFileDialog',features=['F05.S01','F05.S02','F05.S04']);gui.click(cls='QPushButton',text='Save');time.sleep(.5)
    check('export-watchonly-file',['F05.S02'],'The GUI exports a nonempty watch-only backup.',Path(path).is_file() and Path(path).stat().st_size>0)
    for o in gui.tree():
        if o.get('title') and o['window']==o['id']:print(o,flush=True)

def send_payment():
    select_wallet();gui.action('Open URI…');gui.wait(cls='OpenURIDialog')
    address=rpc('getnewaddress',['Recipient'],wallet='Receiver',port=19500)
    uri=f'bitcoin:{address}?amount=1.25&label=Acceptance%20recipient&message=Evidence%20payment'
    gui.text('uriEdit',uri);gui.capture('open-payment-uri',cls='OpenURIDialog',features=['F10.S01','F10.S02']);ok()
    gui.wait(name='payTo')
    check('uri-populates-send',['F10.S01','F10.S02'],'Opening a payment URI populates recipient and amount.',[gui.get('payTo','text'),gui.get('payAmount','value')],[address,125000000])
    try:gui.click(name='buttonChooseFee')
    except RuntimeError:pass
    gui.capture('send-fee-selection',features=['F09.S01','F09.S02','F09.S03','F09.S05','F11.S01','F11.S02','F11.S03','F11.S04'])
    gui.click(name='pushButtonCoinControl');gui.wait(cls='CoinControlDialog')
    gui.capture('coin-control-inputs',cls='CoinControlDialog',features=['F12.S01','F12.S02','F12.S03','F12.S04','F12.S05','F12.S06','F12.S07'])
    gui.close('CoinControlDialog');gui.click(name='sendButton');time.sleep(.4)
    gui.capture('send-review',cls='SendConfirmationDialog',features=['F09.S06','F09.S09','F13.S01','F13.S04'])
    for o in gui.tree():
        if o['class']=='QPushButton':print(o,flush=True)

def transfer_watchonly():
    gui.capture('export-watch-only-success',cls='QMessageBox',features=['F05.S01','F05.S02','F05.S04']);ok()
    rpc('restorewallet',['Transferred monitor','/work/backups/watch-only.dat'],port=19500)
    info=rpc('getwalletinfo',wallet='Transferred monitor',port=19500)
    descriptors=rpc('listdescriptors',wallet='Transferred monitor',port=19500)
    check('watchonly-transfer',['F05.S01','F05.S03','F05.S04'],'Exported wallet restores on another node with private keys disabled and public descriptors only.',[info['private_keys_enabled'],bool(descriptors['descriptors']),any('prv' in d['desc'] for d in descriptors['descriptors'])],[False,True,False])
    gui.action('Restore Wallet…');gui.wait(cls='QFileDialog');gui.text('fileNameEdit','/work/backups/acceptance-wallet.dat')
    gui.capture('restore-wallet-file',cls='QFileDialog',features=['F03.S02']);gui.click(cls='QPushButton',text='Open');time.sleep(.3)
    inspect()

def restore_complete():
    gui.send('text',id=gui.find(cls='QLineEdit')['id'],text='Recovered acceptance wallet')
    gui.capture('restore-wallet-name',cls='QInputDialog',features=['F03.S02','F03.S03']);ok()
    deadline=time.monotonic()+20
    while 'Recovered acceptance wallet' not in rpc('listwallets') and time.monotonic()<deadline:time.sleep(.2)
    info=rpc('getwalletinfo',wallet='Recovered acceptance wallet')
    check('restore-wallet',['F03.S02','F03.S03'],'GUI restores the selected backup under the requested name with spending keys.',[info['walletname'],info['private_keys_enabled']],['Recovered acceptance wallet',True])
    gui.capture('restored-wallet-overview',features=['F03.S02','F03.S03','F02.S02','F02.S03'])
    gui.wait(cls='QMessageBox');gui.capture('restored-wallet-success',cls='QMessageBox',features=['F03.S02','F03.S03']);ok()

def psbt_roundtrip():
    if any(o['class']=='SendConfirmationDialog' for o in gui.tree()):
        gui.wait(cls='QPushButton',text='Create Unsigned');gui.click(cls='QPushButton',text='Create Unsigned')
    time.sleep(.4)
    psbt=gui.send('clipboard')['text'];decoded=rpc('decodepsbt',[psbt])
    check('export-unsigned-psbt',['F13.S01','F13.S02','F13.S03','F13.S04','F13.S05'],'GUI creates a decodable unsigned single-signature PSBT in the system clipboard.',bool(decoded['inputs']) and not any(i.get('partial_signatures') or i.get('final_scriptwitness') for i in decoded['inputs']))
    gui.capture('unsigned-psbt-copied',name='psbt_copied_message',features=['F13.S05'])
    # Dismiss the optional save prompt without altering the PSBT in the clipboard.
    gui.click(cls='QPushButton',text='Discard')
    gui.action('Load PSBT from clipboard…');gui.wait(cls='PSBTOperationsDialog')
    gui.capture('import-unsigned-psbt',cls='PSBTOperationsDialog',features=['F14.S01','F14.S02','F14.S04'])
    gui.click(name='signTransactionButton');gui.click(name='copyToClipboardButton')
    signed=gui.send('clipboard')['text'];result=rpc('finalizepsbt',[signed])
    check('sign-imported-psbt',['F14.S01','F14.S03','F14.S04','F14.S06'],'GUI signs an imported PSBT and copies a complete finalizable PSBT.',result['complete'])
    gui.capture('psbt-signed-ready',cls='PSBTOperationsDialog',features=['F14.S02','F14.S04','F14.S07'])
    txid=rpc('decoderawtransaction',[result['hex']])['txid']
    gui.click(name='broadcastTransactionButton');time.sleep(.3)
    check('broadcast-psbt',['F14.S07','F09.S07'],'GUI broadcast reaches the node mempool.',txid in rpc('getrawmempool'))
    gui.capture('psbt-broadcast',cls='PSBTOperationsDialog',features=['F14.S07']);gui.close('PSBTOperationsDialog')
    gui.action('Transactions');gui.capture('transaction-history',features=['F16.S01','F16.S02','F16.S03','F16.S04','F16.S08'])

def activity():
    select_wallet();gui.action('Transactions')
    view=gui.find(name='transactionView');x,y,w,h=view['geometry']
    subprocess.run(['xdotool','mousemove',str(x+80),str(y+32),'click','3'],env={**os.environ,'DISPLAY':':95'},check=True)
    time.sleep(.3)
    gui.capture('transaction-history-actions',cls='QMenu',features=['F16.S06','F16.S07','F17.S01','F17.S05'])
    gui.action('Copy transaction ID');txid=gui.send('clipboard')['text']
    check('activity-copy-txid',['F16.S06'],'The selected history row copies a real transaction ID.',len(txid)==64)
    gui.action('Show transaction details');gui.wait(cls='TransactionDescDialog')
    gui.capture('transaction-details',cls='TransactionDescDialog',features=['F16.S04','F16.S05','F16.S06']);gui.close('TransactionDescDialog')
    gui.action('Increase transaction fee');time.sleep(.3)
    inspect()

def address_book():
    select_wallet();gui.action('Sending addresses');gui.wait(cls='AddressBookPage')
    gui.click(name='newAddress');gui.wait(cls='EditAddressDialog')
    address=rpc('getnewaddress',['Address book recipient'],wallet='Receiver',port=19500)
    gui.text('labelEdit','Acceptance recipient');gui.text('addressEdit',address)
    gui.capture('add-saved-recipient',cls='EditAddressDialog',features=['F18.S01','F18.S02']);ok()
    check('save-address-label',['F18.S01','F18.S02'],'GUI-created recipient label appears in the wallet address book.',address in rpc('getaddressesbylabel',['Acceptance recipient'],WALLET))
    gui.capture('saved-sending-addresses',cls='AddressBookPage',features=['F18.S01','F18.S02','F18.S04','F18.S05','F18.S06'])
    gui.click(name='exportButton');file_save('/work/backups/addresses.csv')
    csv=Path('/work/backups/addresses.csv').read_text()
    check('export-address-book',['F18.S06'],'GUI CSV export contains the saved address and label.',address in csv and 'Acceptance recipient' in csv)
    gui.close('AddressBookPage');gui.action('Receiving addresses');gui.wait(cls='AddressBookPage')
    gui.capture('saved-receiving-addresses',cls='AddressBookPage',features=['F18.S01','F18.S03','F18.S04','F18.S05']);gui.close('AddressBookPage')

def bump_complete():
    before=rpc('getrawmempool');old=rpc('getmempoolentry',[before[0]])['fees']['base']
    gui.capture('fee-bump-review',cls='SendConfirmationDialog',features=['F17.S01','F17.S02','F17.S03','F17.S04'])
    gui.wait(cls='QPushButton',text='Send');gui.click(cls='QPushButton',text='Send');time.sleep(.5)
    after=rpc('getrawmempool');new=next(t for t in after if t not in before)
    newfee=rpc('getmempoolentry',[new])['fees']['base']
    check('fee-bump-broadcast',['F17.S01','F17.S02','F17.S03'],'The GUI replaces the mempool transaction with a higher-fee transaction.',newfee>old and before[0] not in after)
    gui.capture('fee-bump-result',features=['F17.S01','F17.S03'])

def refresh_overviews():
    select_wallet();gui.action('Overview')
    mask=gui.find(cls='QAction',text='Mask values')
    if gui.send('get',id=mask['id'],property='checked')['value']:gui.action('Mask values')
    gui.capture('overview-balances',features=['F07.S01','F07.S02','F26.S05','F29.S01','F29.S02'])
    select_wallet('Recovered acceptance wallet');time.sleep(.5)
    check('switch-active-wallet',['F02.S03','F28.S02'],'Selecting another wallet changes the application title.', 'Recovered acceptance wallet' in gui.find(cls='BitcoinGUI')['title'])
    gui.capture('restored-wallet-overview',features=['F03.S02','F03.S03','F02.S02','F02.S03']);select_wallet()
    gui.action('Node window');gui.action('Peers');time.sleep(.4)
    o=gui.find(name='peerWidget');x,y,w,h=o['geometry'];subprocess.run(['xdotool','mousemove',str(x+80),str(y+32),'click','1'],env={**os.environ,'DISPLAY':':95'},check=True);time.sleep(.5)
    gui.capture('peers',cls='RPCConsole',features=['F21.S05','F21.S06','F21.S07','F21.S08']);gui.close('RPCConsole')
    gui.action('Disable network activity');time.sleep(.3)
    check('pause-network',['F21.S01','F29.S01'],'The GUI network action pauses peer networking.',rpc('getnetworkinfo')['networkactive'],False)
    gui.capture('network-paused',features=['F21.S01','F29.S01']);gui.action('Enable network activity')
    check('resume-network',['F21.S01'],'The GUI network action resumes peer networking.',rpc('getnetworkinfo')['networkactive'])

def quit_gui():
    for o in gui.tree():
        if o['class'] in ('QMessageBox','QMenu'):gui.send('close',id=o['id'])
    gui.action('Exit')
    try:gui.capture('shutdown-progress',cls='ShutdownWindow',features=['F27.S05','F27.S06'])
    except (RuntimeError,OSError,ValueError):pass

def tray():
    env={**os.environ,'DISPLAY':':95'}
    subprocess.run(['xdotool','key','Escape','mousemove','1424','1066','click','3'],env=env,check=True);time.sleep(.3)
    subprocess.run(['xdotool','mousemove','1325','893','click','1'],env=env,check=True);time.sleep(.3)
    main=gui.find(cls='BitcoinGUI',visible=False)
    check('tray-hide-keeps-node',['F24.S01','F24.S02','F26.S03'],'Native tray Hide makes the main window invisible while node RPC still responds.',[gui.send('get',id=main['id'],property='visible')['value'],rpc('getblockcount')>0],[False,True])
    subprocess.run(['xdotool','mousemove','1424','1066','click','3'],env=env,check=True);time.sleep(.3)
    subprocess.run(['import','-window','root','/evidence/media/widgets/linux-tray-hidden.png'],env=env,check=True)
    subprocess.run(['xdotool','mousemove','1325','893','click','1'],env=env,check=True);time.sleep(.3)
    check('tray-restore-window',['F24.S01','F24.S02'],'Native tray Show restores the main window.',gui.find(cls='BitcoinGUI')['visible'])
    if 'Recovered acceptance wallet' in rpc('listwallets'):rpc('unloadwallet',['Recovered acceptance wallet'])
    rpc('addnode',['127.0.0.1:19445','onetry']);time.sleep(1)
    address=rpc('getnewaddress',['Notification evidence'],WALLET)
    mining=rpc('getnewaddress',['Confirmation fixture'],wallet='Receiver',port=19500)
    rpc('generatetoaddress',[1,mining]);time.sleep(2)
    txid=rpc('sendtoaddress',[address,0.125],wallet='Receiver',port=19500)
    deadline=time.monotonic()+20
    while True:
        try:
            received=rpc('gettransaction',[txid],WALLET)
            break
        except RuntimeError:
            if time.monotonic()>deadline:raise
            time.sleep(.25)
    time.sleep(.7)
    subprocess.run(['import','-window','root','/evidence/media/widgets/linux-payment-notification.png'],env=env,check=True)
    check('notification-payment-arrived',['F25.S01','F25.S02'],'Notification fixture transaction reaches the GUI wallet.',received['amount'],0.125)

def encrypt_wallet():
    select_wallet();gui.action('Encrypt Wallet…');gui.wait(cls='AskPassphraseDialog')
    gui.text('passEdit2','acceptance-test-passphrase');gui.text('passEdit3','acceptance-test-passphrase')
    gui.capture('encrypt-wallet-passphrase',cls='AskPassphraseDialog',features=['F06.S01','F06.S06','F01.S02']);ok();time.sleep(.3)
    inspect()

def security_complete():
    wallets=rpc('listwallets')
    security_wallet=next(o['currentText'] for o in gui.tree() if o['class']=='QComboBox' and o.get('currentText') in wallets)
    if any(o.get('text')=='Continue' for o in gui.tree()):
        gui.capture('encryption-confirmation',cls='QMessageBox',features=['F06.S01','F30.S02']);gui.click(cls='QPushButton',text='Continue')
    deadline=time.monotonic()+20
    while 'unlocked_until' not in rpc('getwalletinfo',wallet=security_wallet) and time.monotonic()<deadline:time.sleep(.2)
    check('encrypt-wallet',['F06.S01'],'After GUI encryption, the backend reports an encrypted, locked wallet.',rpc('getwalletinfo',wallet=security_wallet).get('unlocked_until'),0)
    gui.wait(cls='QMessageBox');gui.capture('wallet-encrypted-result',cls='QMessageBox',features=['F06.S01']);ok()
    gui.action('Change Passphrase…');gui.wait(cls='AskPassphraseDialog')
    gui.text('passEdit1','acceptance-test-passphrase');gui.text('passEdit2','acceptance-new-passphrase');gui.text('passEdit3','acceptance-new-passphrase')
    gui.capture('change-wallet-passphrase',cls='AskPassphraseDialog',features=['F06.S02','F06.S06']);ok();time.sleep(.3)
    gui.wait(cls='QMessageBox');ok()
    rpc('walletpassphrase',['acceptance-new-passphrase',60],security_wallet)
    check('change-passphrase',['F06.S02'],'The new GUI-supplied passphrase unlocks the wallet through Core RPC.',rpc('getwalletinfo',wallet=security_wallet)['unlocked_until']>0)
    rpc('walletlock',wallet=security_wallet)
    gui.action('Overview');gui.capture('encrypted-wallet-status',features=['F06.S05','F29.S04'])
    address=rpc('getnewaddress',['Encrypted message','legacy'],security_wallet)
    gui.action('Sign message…');gui.wait(cls='SignVerifyMessageDialog');gui.text('addressIn_SM',address);gui.text('messageIn_SM','Temporary unlock acceptance check');gui.click(name='signMessageButton_SM')
    gui.wait(cls='AskPassphraseDialog');gui.capture('temporary-unlock-prompt',cls='AskPassphraseDialog',features=['F06.S03','F06.S06']);gui.text('passEdit1','acceptance-new-passphrase');ok();time.sleep(.3)
    signature=gui.get('signatureOut_SM','text')
    check('temporary-unlock-relock',['F06.S03','F06.S04'],'The GUI signs successfully and immediately restores the locked wallet state.',[rpc('verifymessage',[address,signature,'Temporary unlock acceptance check']),rpc('getwalletinfo',wallet=security_wallet)['unlocked_until']],[True,0])
    gui.capture('encrypted-message-signed',cls='SignVerifyMessageDialog',features=['F06.S03','F06.S04','F19.S01']);gui.close('SignVerifyMessageDialog')

def create():
    gui.capture('startup-sync-status',features=['F20.S05','F29.S02','F30.S06'])
    try: gui.click(name='closeButton')
    except RuntimeError: pass
    gui.action('Create Wallet…')
    gui.wait(cls='CreateWalletDialog')
    gui.text('wallet_name_line_edit',WALLET)
    gui.capture('create-wallet-options',cls='CreateWalletDialog',features=['F01.S01','F01.S02','F01.S03','F01.S04','F01.S05','F01.S06'])
    gui.click(cls='QPushButton',text='Create')
    deadline=time.monotonic()+30
    while WALLET not in rpc('listwallets') and time.monotonic()<deadline: time.sleep(.2)
    info=rpc('getwalletinfo',wallet=WALLET)
    check('create-standard-wallet',['F01.S01','F01.S02','F01.S06'],'GUI creates the named, unencrypted descriptor wallet with private keys.',[info['walletname'],info['private_keys_enabled'],info['descriptors'],'unlocked_until' not in info],[WALLET,True,True,True])
    address=rpc('getnewaddress',['Mining fixture'],WALLET)
    rpc('generatetoaddress',[103,address])
    time.sleep(2)
    gui.capture('wallet-overview-funded',features=['F07.S01','F07.S02','F29.S01','F29.S02','F29.S05'])
    for name,checkbox in [('Blank wallet','blank_wallet_checkbox'),('Watch-only wallet','disable_privkeys_checkbox')]:
        gui.action('Create Wallet…'); gui.wait(cls='CreateWalletDialog'); gui.text('wallet_name_line_edit',name); gui.click(name=checkbox)
        gui.capture('create-'+name.lower().replace(' ','-'),cls='CreateWalletDialog',features=['F01.S04' if checkbox.startswith('blank') else 'F01.S03'])
        gui.click(cls='QPushButton',text='Create')
        deadline=time.monotonic()+30
        while name not in rpc('listwallets') and time.monotonic()<deadline: time.sleep(.2)
        info=rpc('getwalletinfo',wallet=name)
        if checkbox.startswith('blank'):
            check('create-blank-wallet',['F01.S04'],'Blank wallet has no generated keys.',info['keypoolsize'],0)
        else:
            check('create-watchonly-wallet',['F01.S03'],'Watch-only wallet has private keys disabled.',info['private_keys_enabled'],False)
    check('multiple-wallets-loaded',['F02.S01','F02.S02'],'All three created wallets remain loaded.',set(rpc('listwallets'))=={WALLET,'Blank wallet','Watch-only wallet'})
    for o in gui.tree():
        if o['class']=='QComboBox': print(o,flush=True)

def create_variants():
    for name,checkbox in [('Blank wallet (empty)','blank_wallet_checkbox'),('Watch-only wallet','disable_privkeys_checkbox')]:
        gui.action('Create Wallet…'); gui.wait(cls='CreateWalletDialog'); gui.text('wallet_name_line_edit',name); gui.click(name=checkbox)
        assert gui.get(checkbox,'checked') is True
        gui.capture('create-'+('blank-wallet' if checkbox.startswith('blank') else 'watch-only-wallet'),cls='CreateWalletDialog',features=['F01.S04' if checkbox.startswith('blank') else 'F01.S03'])
        gui.click(cls='QPushButton',text='Create')
        deadline=time.monotonic()+30
        while name not in rpc('listwallets') and time.monotonic()<deadline: time.sleep(.2)
        info=rpc('getwalletinfo',wallet=name)
        if checkbox.startswith('blank'):
            check('create-blank-wallet',['F01.S04'],'Blank wallet has no generated keys.',info['keypoolsize'],0)
        else:
            check('create-watchonly-wallet',['F01.S03'],'Watch-only wallet has private keys disabled.',info['private_keys_enabled'],False)
    check('multiple-wallets-loaded',['F02.S01','F02.S02'],'Several wallets remain loaded.',len(rpc('listwallets'))>=3)
    for o in gui.tree():
        if o['class']=='QComboBox': print(o,flush=True)

if __name__=='__main__':
    globals()[sys.argv[1]]()
