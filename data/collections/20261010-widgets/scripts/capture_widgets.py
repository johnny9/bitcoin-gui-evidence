"""Additional real Qt Widgets captures; isolated regtest fixtures and RPC oracles."""
import re,base64,datetime,hashlib,json,os,subprocess,sys,time,traceback,urllib.request
from pathlib import Path
from urllib.parse import quote
from widgets_driver import Driver,ROOT
os.environ['DISPLAY']=':98'
gui=None

def rpc(method,params=None,wallet=None,port=19643):
    request=urllib.request.Request(f'http://127.0.0.1:{port}/'+('wallet/'+quote(wallet) if wallet else ''),json.dumps({'jsonrpc':'2.0','id':1,'method':method,'params':params or []}).encode())
    request.add_header('Authorization','Basic '+base64.b64encode(b'evidence:synthetic-test-only').decode())
    try: result=json.load(urllib.request.urlopen(request,timeout=90))
    except urllib.error.HTTPError as e: raise RuntimeError(e.read().decode()) from e
    if result.get('error'):raise RuntimeError(result['error'])
    return result['result']

def waitfor(fn,timeout=30):
    deadline=time.monotonic()+timeout
    while time.monotonic()<deadline:
        try:
            result=fn()
            if result:return result
        except (RuntimeError,ConnectionError,urllib.error.URLError):pass
        time.sleep(.1)
    raise RuntimeError('Timed out waiting for '+str(fn))

def check(id,features,description,actual,expected=True):
    row={'id':id,'features':features,'description':description,'actual':actual,'expected':expected,'status':'passed' if actual==expected else 'failed','utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    path=ROOT/'logs/checks.json'; rows=json.loads(path.read_text()) if path.exists() else []
    rows=[r for r in rows if r['id']!=id]+[row];path.write_text(json.dumps(rows,indent=2)+'\n')
    print(json.dumps(row),flush=True);assert actual==expected,description

def snap(name,features,caption,cls='BitcoinGUI',note=''):
    return gui.capture(name,cls=cls,features=features,note=caption+(' '+note if note else ''))

def desktop(name,features,caption):
    path=ROOT/'media/widgets'/f'{name}.png'
    time.sleep(.3);subprocess.run(['import','-window','root',str(path)],check=True)
    row={'path':str(path.relative_to(ROOT)),'caption':caption,'features':features,'note':'Original X11 desktop capture.','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    p=ROOT/'media/widgets/captures.json';rows=json.loads(p.read_text()) if p.exists() else [];rows=[r for r in rows if r['path']!=row['path']]+[row];p.write_text(json.dumps(rows,indent=2)+'\n')

def ok():gui.click(cls='QPushButton',text='OK')
def choose(name):
    names=rpc('listwallets');box=next(o for o in gui.tree() if o['class']=='QComboBox' and o.get('currentText') in names)
    gui.send('set',id=box['id'],property='currentText',value=name);time.sleep(.3)

def tree():
    for o in gui.tree():
        if o['class'] not in ('QFrame','QScrollBar'):print(json.dumps(o))
def xclick(obj,dx,dy,button=1,count=1):
    x,y,w,h=obj['geometry'];subprocess.run(['xdotool','mousemove',str(x+dx),str(y+dy),'click','--repeat',str(count),'--delay','100',str(button)],check=True);time.sleep(.3)
def fixture():
    waitfor(lambda:rpc('getblockchaininfo'))
    rpc('createwallet',['Reference wallet']);rpc('createwallet',['Recipient wallet'])
    mining=rpc('getnewaddress',['Mining fixture'],wallet='Reference wallet');rpc('generatetoaddress',[110,mining])
    recipient=rpc('getnewaddress',['Capture recipient'],wallet='Recipient wallet')
    tx=rpc('sendtoaddress',[recipient,1],wallet='Reference wallet');rpc('generatetoaddress',[1,mining])
    pub=rpc('listdescriptors',wallet='Reference wallet')['descriptors']
    rpc('createwallet',{'wallet_name':'Watch-only monitor','disable_private_keys':True,'blank':True})
    imported=rpc('importdescriptors',[[dict(desc=d['desc'],timestamp=0,active=d['active'],internal=d['internal'],range=d.get('range',[0,10]),next_index=d.get('next_index',0)) for d in pub]],wallet='Watch-only monitor')
    assert all(r['success'] for r in imported)
    (ROOT/'fixture.json').write_text(json.dumps({'mining':mining,'recipient':recipient,'txid':tx},indent=2)+'\n')
    waitfor(lambda:len([o for o in gui.tree() if o['class']=='QComboBox' and o.get('currentText') in rpc('listwallets')])>0)
    choose('Reference wallet');gui.action('Overview');time.sleep(2)
    try:gui.click(name='closeButton')
    except RuntimeError:pass
    snap('fixture-overview',[],'Fresh synthetic regtest wallet used for the additional capture pass.')

def startup_status():
    snap('sync-overlay-wallet-outdated',['F07.S04','F30.S07'],'Synchronization overlay explains that wallet information can be out of date. Synthetic regtest at genesis; not a mainnet IBD run.')
    gui.click(name='closeButton');snap('sync-background-wallet-access',['F07.S04','F30.S07'],'Wallet remains accessible while the status bar reports incomplete synchronization.')
    fixture=json.loads((ROOT/'fixture.json').read_text())
    rpc('generatetoaddress',[112,fixture['mining']]);time.sleep(2)
    rpc('sendtoaddress',[fixture['recipient'],1],wallet='Reference wallet');rpc('generatetoaddress',[1,fixture['mining']]);time.sleep(1)
    main=gui.find(cls='BitcoinGUI');subprocess.run(['xdotool','search','--name',re.escape(main['title']),'windowsize','1100','780'],check=True)
    check('fixture-funded',[],'Synthetic reference wallet has spendable regtest coins.',rpc('getbalances',wallet='Reference wallet')['mine']['trusted']>0)

def wallet_basics():
    choose('Recipient wallet');gui.action('Close Wallet…');gui.wait(cls='QMessageBox')
    snap('close-wallet-confirmation',['F02.S04','F30.S04'],'Closing the selected wallet requires confirmation.',cls='QMessageBox')
    gui.click(cls='QPushButton',text='Yes');waitfor(lambda:'Recipient wallet' not in rpc('listwallets'))
    check('close-selected-wallet',['F02.S04'],'GUI closes the selected wallet while other wallets remain loaded.','Reference wallet' in rpc('listwallets') and 'Recipient wallet' not in rpc('listwallets'))
    subprocess.run(['xdotool','key','alt+f'],check=True);time.sleep(.2)
    desktop('open-wallet-menu',['F02.S01'],'File menu offers opening an existing wallet.')
    tree()

def watch_receive():
    choose('Watch-only monitor');gui.action('Receive');gui.text('reqLabel','Watch-only receiving proof');gui.click(name='receiveButton');gui.wait(cls='ReceiveRequestDialog')
    address=gui.get('address_content','text')
    check('watchonly-receive',['F08.S09'],'Watch-only wallet generates a receive address from imported public descriptors.',[rpc('getwalletinfo',wallet='Watch-only monitor')['private_keys_enabled'],rpc('getaddressinfo',[address],wallet='Watch-only monitor')['ismine']],[False,True])
    snap('watchonly-receiving-address',['F08.S09'],'Receiving address generated from a configured wallet with private keys disabled.',cls='ReceiveRequestDialog');gui.close('ReceiveRequestDialog')

def input_warnings():
    choose('Reference wallet');gui.action('Encrypt Wallet…');gui.wait(cls='AskPassphraseDialog');gui.text('passEdit2','synthetic-one');gui.text('passEdit3','synthetic-two');ok()
    # Some versions confirm the encryption action before validating the two entries.
    time.sleep(.3)
    if any(o.get('text')=='Continue' for o in gui.tree()):gui.click(cls='QPushButton',text='Continue')
    gui.wait(cls='QMessageBox');labels=' '.join(o.get('text','') for o in gui.tree())
    check('passphrase-mismatch',['F06.S07','F30.S01'],'Different repeated passphrases produce a visible validation error.','do not match' in labels.lower())
    snap('passphrase-mismatch-error',['F06.S07','F30.S01'],'The application rejects mismatching repeated passphrases.',cls='QMessageBox');ok();gui.close('AskPassphraseDialog')
    gui.action('Options…');gui.set('tabWidget','currentIndex',1)
    for name in ['coinControlFeatures','m_enable_psbt_controls']:
        if not gui.get(name,'checked'):gui.click(name=name)
    ok();gui.action('Send');gui.click(name='checkBoxCoinControlChange')
    gui.click(name='lineEditCoinControlChange');subprocess.run(['xdotool','type','--clearmodifiers',json.loads((ROOT/'fixture.json').read_text())['recipient']],check=True);time.sleep(.3)
    change_warning()

def console_command(command):
    gui.text('lineEdit',command);gui.send('key',id=gui.find(name='lineEdit')['id'],key=16777220);time.sleep(.5)

def rpc_tools():
    choose('Reference wallet');gui.action('Node window');gui.action('Console');console_command('help importdescriptors')
    snap('console-import-descriptors-help',['F22.S09'],'The in-app RPC console documents descriptor import, including rescanning.',cls='RPCConsole',note='Visual evidence for RPC access and help; not proof of every advanced operation.')
    console_command('getwalletinfo');snap('diagnostics-alongside-wallet',['F26.S04'],'Node diagnostics can remain open alongside the wallet.',cls='RPCConsole');desktop('diagnostics-and-wallet-windows',['F26.S04'],'Independent node and wallet windows are open together.')
    gui.action('Peers');rpc('setban',['192.0.2.0/24','add',3600]);time.sleep(1)
    tree()

def privacy_windows():
    try:gui.close('RPCConsole')
    except RuntimeError:pass
    choose('Reference wallet');gui.action('Overview');gui.action('Mask values');choose('Watch-only monitor');gui.action('Overview')
    check('privacy-across-wallets',['F32.S03'],'The mask preference remains enabled after switching wallets.','#' in str(gui.get('labelBalance','text')))
    snap('privacy-watchonly-wallet',['F32.S03'],'Values remain masked after switching to another loaded wallet.')
    main=gui.find(cls='BitcoinGUI');wid=subprocess.check_output(['xdotool','search','--name',re.escape(main['title'])],text=True).strip().splitlines()[-1]
    subprocess.run(['xdotool','windowmove',wid,'80','90','windowsize',wid,'1080','740'],check=True);time.sleep(.3)
    desktop('window-position-before-restart',['F26.S01','F26.S02'],'Window arranged before restarting to verify saved placement.')
    (ROOT/'window-before.json').write_text(json.dumps(gui.find(cls='BitcoinGUI')['geometry']))

def restart_proof():
    choose('Watch-only monitor');gui.action('Overview')
    check('privacy-restored',['F32.S04'],'After restart the saved privacy preference still masks balances.','#' in str(gui.get('labelBalance','text')))
    before=json.loads((ROOT/'window-before.json').read_text());after=gui.find(cls='BitcoinGUI')['geometry']
    check('window-placement-restored',['F26.S02'],'Main window size and position survive a clean restart.',after,before)
    desktop('window-and-privacy-after-restart',['F26.S02','F32.S04'],'Restored window placement and masked balances after restarting the application.')
    gui.action('Mask values')

def shutdown():
    gui.action('Exit')
    try:
        obj=gui.wait(cls='ShutdownWindow',timeout=3)
        # Grab promptly; an empty regtest node can finish in less than half a second.
        path=ROOT/'media/widgets/shutdown-progress.png';gui.send('capture',id=obj['id'],path=str(path))
        p=ROOT/'media/widgets/captures.json';rows=json.loads(p.read_text());rows.append({'path':str(path.relative_to(ROOT)),'caption':'Orderly shutdown in progress','features':['F27.S05','F27.S06'],'note':'Actual application shutdown window.','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()});p.write_text(json.dumps(rows,indent=2)+'\n')
    except Exception as e:print('Shutdown frame was too brief:',e)

def wallet_open():
    subprocess.run(['xdotool','key','Down','Right'],check=True);time.sleep(.3)
    desktop('open-existing-wallet',['F02.S01'],'Open Wallet lists the closed Recipient wallet for reopening.')
    gui.action('Recipient wallet');subprocess.run(['xdotool','key','Escape','Escape'],check=True)
    waitfor(lambda:'Recipient wallet' in rpc('listwallets'));choose('Recipient wallet')
    check('reopen-existing-wallet',['F02.S01'],'The GUI reopens the previously closed wallet.','Recipient wallet' in rpc('listwallets'))
    snap('reopened-wallet',['F02.S01'],'Previously closed wallet is open again and active.')
    subprocess.run(['xdotool','search','--name','^Bitcoin Core -','windowmove','120','90'],check=True)

def psbt_watchonly():
    try:gui.close('RPCConsole')
    except RuntimeError:pass
    choose('Watch-only monitor');gui.action('Send')
    gui.text('payTo',json.loads((ROOT/'fixture.json').read_text())['recipient']);gui.set('payAmount','value',25000000)
    snap('watchonly-prepare-payment',['F09.S08','F13.S02'],'Configured watch-only wallet prepares a payment without spending keys.')
    gui.click(name='sendButton');gui.wait(cls='SendConfirmationDialog')
    snap('watchonly-unsigned-review',['F09.S08','F13.S02','F13.S03'],'Watch-only single-signature transaction review offers unsigned creation.',cls='SendConfirmationDialog')
    dialog_click('Create Unsigned');gui.wait(name='psbt_copied_message')
    psbt=gui.send('clipboard')['text'];decoded=rpc('decodepsbt',[psbt]);assert decoded['inputs']
    check('watchonly-unsigned-psbt',['F09.S08','F13.S02','F13.S03','F13.S05'],'Watch-only GUI produces a decodable PSBT in the clipboard without signatures.',not any(i.get('partial_signatures') or i.get('final_scriptwitness') for i in decoded['inputs']))
    snap('unsigned-psbt-clipboard',['F13.S05'],'The unsigned transaction has been copied to the clipboard and can be saved.',cls='QMessageBox')
    gui.click(cls='QPushButton',text='Save');gui.wait(cls='QFileDialog');gui.text('fileNameEdit',str(ROOT/'unsigned-watchonly.psbt'));snap('unsigned-psbt-save',['F13.S05'],'Save the unsigned PSBT for offline signing.',cls='QFileDialog');gui.click(cls='QPushButton',text='Save')
    waitfor(lambda:(ROOT/'unsigned-watchonly.psbt').exists());check('psbt-file-roundtrip',['F13.S05'],'Saved PSBT matches the clipboard transaction.',base64.b64encode((ROOT/'unsigned-watchonly.psbt').read_bytes()).decode(),psbt)
    choose('Reference wallet');gui.send('setClipboard',text=psbt);gui.action('Load PSBT from clipboard…');gui.wait(cls='PSBTOperationsDialog')
    gui.click(name='signTransactionButton');gui.click(name='copyToClipboardButton');signed=gui.send('clipboard')['text'];final=rpc('finalizepsbt',[signed]);assert final['complete']
    check('sign-watchonly-proposal',['F09.S07','F14.S03','F14.S06'],'A wallet with the matching local key signs the watch-only proposal and exports a finalizable PSBT.',final['complete'])
    snap('signed-psbt-export',['F09.S07','F14.S03','F14.S06'],'Matching local wallet signs the imported single-signature PSBT and copies it for further transfer.',cls='PSBTOperationsDialog')
    (ROOT/'signed-psbt.txt').write_text(signed);gui.close('PSBTOperationsDialog')

def recent_history():
    choose('Reference wallet');gui.action('Overview')
    view=gui.find(name='listTransactions');xclick(view,80,28)
    check('recent-opens-history',['F07.S03'],'Clicking a recent transaction opens the full history.',gui.find(name='transactionView')['visible'])
    snap('recent-transaction-in-history',['F07.S03'],'A recent overview transaction is selected in the full transaction history.')
    gui.send('key',id=gui.find(cls='BitcoinGUI')['id'],key=49,modifiers=134217728)
    check('keyboard-overview',['F28.S05'],'Alt+1 returns to the overview.',gui.find(cls='OverviewPage')['visible'])
    snap('keyboard-navigation-overview',['F28.S05'],'Overview reached through the application keyboard shortcut.')

def change_warning():
    snap('unknown-change-confirmation',['F12.S09','F30.S04'],'A destination outside this wallet triggers an explicit warning before using it for change.',cls='QMessageBox')
    check('unknown-change-confirmation',['F12.S09'],'Application requires confirmation for a change destination outside the selected wallet.',any('not part of this wallet' in o.get('text','') for o in gui.tree()))
    gui.click(cls='QPushButton',text='Cancel')
    if gui.get('checkBoxCoinControlChange','checked'):gui.click(name='checkBoxCoinControlChange')

def ready():
    try:gui.click(name='closeButton')
    except RuntimeError:pass
    choose('Reference wallet');gui.action('Options…');gui.set('tabWidget','currentIndex',1)
    for name in ['coinControlFeatures','m_enable_psbt_controls']:
        if not gui.get(name,'checked'):gui.click(name=name)
    ok()
    fixture=json.loads((ROOT/'fixture.json').read_text())
    if rpc('getblockcount')<100:rpc('generatetoaddress',[113,fixture['mining']])
    time.sleep(1)
    subprocess.run(['xdotool','search','--name','^Bitcoin Core -','windowsize','1100','780','windowmove','120','90'],check=True)
    check('fixture-funded',[],'Synthetic reference wallet has spendable regtest coins.',rpc('getbalances',wallet='Reference wallet')['mine']['trusted']>0)

def dialog_click(text,cls='SendConfirmationDialog'):
    dialog=gui.find(cls=cls)
    def enabled_button():
        return next((o for o in gui.tree() if o['class']=='QPushButton' and o['window']==dialog['id'] and o.get('text','').replace('&','')==text and o['enabled']),None)
    button=waitfor(enabled_button);gui.send('click',id=button['id']);time.sleep(.3)

def banned_clipboard():
    xclick(gui.find(name='banlistWidget'),100,32,button=3)
    desktop('banned-range-context-menu',['F21.S09'],'The banned-network row exposes copying the selected IP or network range.')
    tree()

def migrate_legacy():
    try:gui.close('RPCConsole')
    except RuntimeError:pass
    subprocess.run(['xdotool','key','Escape','Escape','alt+f','Home','Down','Down','Down','Down','Right'],check=True);time.sleep(.3)
    gui.action('Restore and Migrate Wallet File…');gui.wait(cls='QFileDialog');gui.text('fileNameEdit',str(ROOT/'Legacy-savings.dat'));gui.click(cls='QPushButton',text='Open')
    gui.wait(cls='QInputDialog');gui.send('text',id=gui.find(cls='QLineEdit')['id'],text='Migrated savings');ok();gui.wait(cls='QMessageBox')
    snap('restore-migrate-legacy-confirmation',['F03.S04','F04.S01','F04.S02','F04.S03'],'Legacy backup restore explains descriptor conversion, the automatic backup, and separate watch-only wallets.',cls='QMessageBox')
    gui.click(cls='QPushButton',text='Yes');waitfor(lambda:'Migrated savings' in rpc('listwallets'),timeout=60)
    gui.wait(cls='QMessageBox',timeout=60)
    info=rpc('getwalletinfo',wallet='Migrated savings');legacy=json.loads((ROOT/'legacy-fixture.json').read_text())['Legacy savings']
    check('legacy-restore-migrate',['F03.S04','F04.S01'],'GUI restores a legacy backup and converts it into a loaded SQLite descriptor wallet.',[info['descriptors'],info['format']],[True,'sqlite'])
    migrate_finish()

def migrate_finish():
    legacy=json.loads((ROOT/'legacy-fixture.json').read_text())['Legacy savings']
    backups=list((ROOT/'node/regtest/wallets').glob('Migrated savings_*.legacy.bak'))
    check('migration-backup',['F04.S02'],'GUI migration automatically retains a nonempty original-format backup.',bool(backups) and all(p.stat().st_size>0 for p in backups))
    watched='Migrated savings_watchonly'
    check('migration-contents',['F04.S03'],'Original receiving labels and watch-only information survive migration.',[legacy['ownedAddress'] in rpc('getaddressesbylabel',['Preserved savings'],wallet='Migrated savings'),legacy['watchedAddress'] in rpc('getaddressesbylabel',['Preserved watch-only'],wallet=watched),rpc('getwalletinfo',wallet=watched)['private_keys_enabled']],[True,True,False])
    snap('legacy-migration-success',['F03.S04','F04.S01','F04.S02','F04.S03','F04.S04'],'Migration reports the converted wallet and the separated watch-only wallet.',cls='QMessageBox');ok();subprocess.run(['xdotool','key','Escape','Escape'],check=True)
    choose(watched);gui.action('Receiving addresses');snap('migrated-watchonly-labels',['F04.S03'],'The migrated watch-only wallet retains its labeled receiving address.',cls='AddressBookPage');gui.close('AddressBookPage')
    subprocess.run(['xdotool','key','alt+f','Home','Down','Down','Down','Down','Right'],check=True);time.sleep(.3);gui.action('Legacy deferred');gui.wait(cls='QMessageBox')
    gui.click(cls='QCheckBox',text='Load wallet after migration');snap('migrate-without-opening',['F04.S04'],'Migration can finish without immediately loading the converted wallet.',cls='QMessageBox');gui.click(cls='QPushButton',text='Yes')
    waitfor(lambda:(ROOT/'node/regtest/wallets/Legacy deferred/wallet.dat').read_bytes()[:16]==b'SQLite format 3\x00',timeout=60)
    gui.wait(cls='QMessageBox',timeout=60);snap('deferred-migration-success',['F04.S04'],'Migration completed with loading disabled.',cls='QMessageBox');ok();subprocess.run(['xdotool','key','Escape','Escape'],check=True)
    check('deferred-migration-unloaded',['F04.S04'],'Wallet is migrated on disk and remains unloaded.','Legacy deferred' not in rpc('listwallets'))
    subprocess.run(['xdotool','key','alt+f','Home','Down','Right'],check=True);time.sleep(.3);gui.action('Legacy deferred');waitfor(lambda:'Legacy deferred' in rpc('listwallets'));subprocess.run(['xdotool','key','Escape','Escape'],check=True)
    check('open-deferred-migrated-wallet',['F04.S04'],'Previously deferred migrated wallet can later be opened through the GUI.',rpc('getwalletinfo',wallet='Legacy deferred')['descriptors'])
    choose('Legacy deferred');snap('deferred-wallet-opened',['F04.S04'],'The previously deferred migrated wallet is now open.')

def refresh_psbt_review():
    choose('Watch-only monitor');gui.action('Send');gui.text('payTo',json.loads((ROOT/'fixture.json').read_text())['recipient']);gui.set('payAmount','value',25000000);gui.click(name='sendButton');gui.wait(cls='SendConfirmationDialog');time.sleep(4)
    snap('watchonly-unsigned-review',['F09.S08','F13.S02','F13.S03'],'Watch-only single-signature transaction review offers unsigned creation after the review countdown.',cls='SendConfirmationDialog');dialog_click('Cancel')

def multisig_signing():
    data=json.loads((ROOT/'multisig-fixture.json').read_text());choose('Cosigner A')
    gui.send('setClipboard',text=data['unsignedPsbt']);gui.action('Load PSBT from clipboard…');gui.wait(cls='PSBTOperationsDialog');gui.click(name='signTransactionButton');gui.click(name='copyToClipboardButton');partial=gui.send('clipboard')['text']
    result=rpc('finalizepsbt',[partial]);check('multisig-partial-signature-present',['F14.S03','F14.S05'],'The first cosigner adds exactly one partial signature.',sum(len(i.get('partial_signatures',{})) for i in rpc('decodepsbt',[partial])['inputs']),1)
    check('first-multisig-signature',['F14.S03','F14.S05','F14.S06'],'First local cosigner signs and exports a PSBT that still needs the second signature.',result['complete'],False)
    snap('multisig-first-signature',['F14.S03','F14.S05','F14.S06'],'First cosigner has signed; the PSBT still requires another signer.',cls='PSBTOperationsDialog');gui.close('PSBTOperationsDialog')
    choose('Cosigner B');gui.send('setClipboard',text=partial);gui.action('Load PSBT from clipboard…');gui.wait(cls='PSBTOperationsDialog');gui.click(name='signTransactionButton');gui.click(name='copyToClipboardButton');complete=gui.send('clipboard')['text']
    (ROOT/'complete-multisig-psbt.txt').write_text(complete)
    check('second-multisig-signature',['F14.S03','F14.S05'],'Passing the first signer PSBT to the second GUI wallet yields a complete transaction.',rpc('finalizepsbt',[complete])['complete'])
    snap('multisig-second-signature',['F14.S03','F14.S05'],'Second cosigner completes the 2-of-2 transaction; broadcast becomes available.',cls='PSBTOperationsDialog');gui.close('PSBTOperationsDialog')

def copy_banned_range():
    gui.action('Node window');gui.action('Peers');view=gui.find(name='banlistWidget');xclick(view,40,32);xclick(view,40,32,button=3)
    desktop('banned-range-context-menu',['F21.S09'],'Selected banned network range offers Copy IP/Netmask.')
    gui.action('Copy IP/Netmask');subprocess.run(['xdotool','key','Escape'],check=True)
    check('copy-banned-range',['F21.S09'],'Copy IP/Netmask writes the selected banned range to the clipboard.',gui.send('clipboard')['text'],'192.0.2.0/24')
    snap('banned-range-selected',['F21.S09'],'Selected banned range after copying its IP/netmask.',cls='RPCConsole');gui.close('RPCConsole')

def immediate_capture(label,obj,features,caption):
    path=ROOT/'media/widgets'/f'{label}.png';gui.send('capture',id=obj['id'],path=str(path))
    p=ROOT/'media/widgets/captures.json';rows=json.loads(p.read_text());rows=[r for r in rows if r['path']!=str(path.relative_to(ROOT))];rows.append({'path':str(path.relative_to(ROOT)),'caption':caption,'features':features,'note':'Original application frame captured during the live operation.','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()});p.write_text(json.dumps(rows,indent=2)+'\n')

def rescan_progress():
    from concurrent.futures import ThreadPoolExecutor
    choose('Watch-only monitor');gui.action('Overview')
    with ThreadPoolExecutor() as pool:
        run=pool.submit(rpc,'rescanblockchain',[0],wallet='Watch-only monitor')
        dialog=gui.wait(cls='QProgressDialog',timeout=15)
        immediate_capture('rescan-progress',dialog,['F34.S01','F34.S02','F30.S05'],'Actual wallet rescan progress over a 15,000-block regtest history.')
        result=run.result(timeout=90)
        check('wallet-rescan-completed',['F34.S01','F34.S02'],'Rescan completes through the current chain tip.',result['stop_height'],rpc('getblockcount'))
        run=pool.submit(rpc,'rescanblockchain',[0],wallet='Watch-only monitor');dialog=gui.wait(cls='QProgressDialog',timeout=15)
        immediate_capture('rescan-cancel-available',dialog,['F34.S03'],'The ongoing wallet rescan offers cancellation.')
        gui.click(cls='QPushButton',text='Cancel')
        try:result=run.result(timeout=90);cancelled=False
        except RuntimeError as e:cancelled='aborted' in str(e).lower();(ROOT/'logs/rescan-cancel-result.txt').write_text(str(e)+'\n')
        check('wallet-rescan-cancelled',['F34.S03'],'GUI cancellation causes the in-progress rescan to return an abort result.',cancelled)

def external_uri():
    choose('Reference wallet');gui.action('Send');gui.click(name='clearButton')
    address=json.loads((ROOT/'fixture.json').read_text())['recipient'];uri='bitcoin:'+address+'?amount=0.125&label=External%20payment%20request'
    env={**os.environ,'DISPLAY':':98','XDG_CONFIG_HOME':str(ROOT/'config')};env.pop('LD_PRELOAD',None)
    result=subprocess.run(['/work/widgets-build/bin/bitcoin-qt','-regtest','-datadir='+str(ROOT/'node'),uri],env=env,capture_output=True,timeout=30)
    (ROOT/'logs/uri-handoff.stderr').write_bytes(result.stderr)
    waitfor(lambda:gui.get('payTo','text')==address)
    check('running-uri-handoff',['F10.S03','F31.S01'],'A second process passes its payment URI to the already-running GUI.',[result.returncode,gui.get('payTo','text'),gui.get('payAmount','value')],[0,address,12500000])
    snap('external-payment-uri-received',['F10.S03','F31.S01'],'Payment URI launched from another process populates the running wallet send form. Linux process handoff; OS association and URI dragging are not covered.')

def tooltip_guidance():
    target=gui.find(name='checkboxSubtractFeeFromAmount');x,y,w,h=target['geometry'];subprocess.run(['xdotool','mousemove',str(x+40),str(y+h//2)],check=True);time.sleep(1.2)
    desktop('send-contextual-guidance',['F29.S06'],'Hover guidance explains how subtracting fees changes the recipient amount.')

def drag_qr():
    choose('Reference wallet');gui.action('Receive');gui.text('reqLabel','QR drag proof');gui.click(name='receiveButton');gui.wait(cls='ReceiveRequestDialog')
    env={**os.environ,'WIDGETS_PASS_ROOT':str(ROOT),'DISPLAY':':98'};receiver=subprocess.Popen([str(ROOT/'external-fixture')],env=env);time.sleep(.5)
    subprocess.run(['xdotool','search','--name','Request payment to QR drag proof','windowmove','180','160'],check=True)
    label=gui.find(cls='QRImageWidget');x,y,w,h=label['geometry']
    subprocess.run(['xdotool','mousemove',str(x+w//2),str(y+h//2),'mousedown','1','mousemove','--sync',str(x+w//2+50),str(y+h//2),'sleep','.3','mousemove','--sync','1100','340','sleep','.3','mouseup','1'],check=True)
    waitfor(lambda:(ROOT/'logs/qr-drop.json').exists(),timeout=10)
    check('qr-drag-to-external-app',['F08.S06'],'Actual drag-and-drop delivers an image to an independent Qt application.',json.loads((ROOT/'logs/qr-drop.json').read_text())['received'])
    desktop('qr-drag-delivered',['F08.S06'],'QR image dragged from Bitcoin Core into an independent image-receiver test application.')
    receiver.terminate();receiver.wait(timeout=10);gui.close('ReceiveRequestDialog')

def desktop_files():
    choose('Reference wallet');gui.action('Node window');gui.action('Information');gui.click(name='openDebugLogfileButton');time.sleep(1)
    desktop('debug-log-opened',['F22.S04'],'Bitcoin Core opens the actual debug log in the configured external document viewer.')
    records=[json.loads(s) for s in (ROOT/'logs/external-opens.jsonl').read_text().splitlines()];check('open-debug-log',['F22.S04'],'The GUI passes its regtest debug.log path to the external viewer.',records[-1]['target'],str(ROOT/'node/regtest/debug.log'))
    subprocess.run(['pkill','-TERM','-f','^'+str(ROOT/'external-fixture')+' '],check=True);gui.close('RPCConsole')
    gui.action('Options…');gui.set('tabWidget','currentIndex',0);gui.click(name='openBitcoinConfButton');gui.wait(cls='QMessageBox')
    snap('advanced-configuration-prompt',['F23.S10'],'Configuration dialog explains that advanced file settings override GUI preferences.',cls='QMessageBox');gui.click(cls='QPushButton',text='Continue');time.sleep(1)
    records=[json.loads(s) for s in (ROOT/'logs/external-opens.jsonl').read_text().splitlines()];check('open-configuration-file',['F23.S10'],'The GUI opens bitcoin.conf using the configured external application.',records[-1]['target'],str(ROOT/'node/bitcoin.conf'))
    desktop('advanced-configuration-opened',['F23.S10'],'Application configuration is opened through the desktop file association. The test viewer is read-only; editing is not exercised.')
    subprocess.run(['pkill','-TERM','-f','^'+str(ROOT/'external-fixture')+' '],check=True);gui.close('OptionsDialog')

def export_monitor():
    choose('Reference wallet');gui.action('Export watch-only wallet');gui.wait(cls='QFileDialog');gui.text('fileNameEdit',str(ROOT/'monitor-export.dat'));gui.click(cls='QPushButton',text='Save');gui.wait(cls='QMessageBox');ok()

def no_wallet_psbt():
    gui.action('Close All Wallets…');gui.wait(cls='QMessageBox');snap('close-all-wallets',['F02.S04'],'Close all loaded wallets while keeping the node running.',cls='QMessageBox');gui.click(cls='QPushButton',text='Yes');waitfor(lambda:not rpc('listwallets'))
    check('node-without-wallets',['F02.S04','F20.S06'],'After the GUI closes all wallets, node RPC still responds.',[rpc('listwallets'),rpc('getblockcount')>15000],[[],True])
    snap('node-running-without-wallets',['F20.S06'],'Bitcoin Core remains running with no wallet open.')
    signed=(ROOT/'complete-multisig-psbt.txt').read_text();gui.send('setClipboard',text=signed);gui.action('Load PSBT from clipboard…');gui.wait(cls='PSBTOperationsDialog')
    snap('wallet-free-psbt-review',['F14.S08'],'A fully signed transaction can be inspected with no wallet open.',cls='PSBTOperationsDialog');txid=rpc('decoderawtransaction',[rpc('finalizepsbt',[signed])['hex']])['txid']
    gui.click(name='broadcastTransactionButton');waitfor(lambda:txid in rpc('getrawmempool'))
    check('wallet-free-broadcast',['F14.S08'],'GUI broadcasts the fully signed multisig transaction with no loaded wallet.',[rpc('listwallets'),txid in rpc('getrawmempool')],[[],True])
    snap('wallet-free-psbt-broadcast',['F14.S08'],'Successful transaction broadcast from the wallet-free PSBT dialog.',cls='PSBTOperationsDialog');gui.close('PSBTOperationsDialog')

def reset_preferences():
    gui.action('Options…');gui.click(name='resetButton');gui.wait(cls='QMessageBox')
    snap('reset-preferences-backup',['F23.S12'],'Reset confirmation identifies the settings backup and required shutdown.',cls='QMessageBox');gui.click(cls='QPushButton',text='Yes')

def post_reset_minimized():
    waitfor(lambda:'Reference wallet' in gui.find(cls='BitcoinGUI',visible=False)['title'])
    main=gui.find(cls='BitcoinGUI',visible=False)
    check('start-minimized',['F27.S02'],'The -min startup option starts the main window minimized.',gui.send('get',id=main['id'],property='minimized')['value'])
    subprocess.run(['xdotool','mousemove','1425','1066','click','3'],check=True);time.sleep(.3)
    desktop('started-minimized',['F27.S02'],'Application starts minimized with node RPC running; its native tray menu remains available.')
    subprocess.run(['xdotool','key','Escape'],check=True);gui.send('show',id=main['id']);time.sleep(.3)
    gui.action('Options…');gui.set('tabWidget','currentIndex',1)
    check('preferences-reset-backed-up',['F23.S12'],'Reset preserves the former preferences in a backup and restores the advanced-control default.',['fCoinControlFeatures=true' in (ROOT/'node/regtest/guisettings.ini.bak').read_text(),gui.get('coinControlFeatures','checked'),(ROOT/'node/regtest/settings.json.bak').exists()],[True,False,True])
    snap('preferences-restored-defaults',['F23.S12'],'After reset and restart, advanced controls return to their default unchecked state.',cls='OptionsDialog');ok()

def explorer_configure():
    choose('Reference wallet');gui.action('Options…');gui.set('tabWidget','currentIndex',4);gui.text('thirdPartyTxUrls','https://explorer.invalid/tx/%s');ok()
    gui.action('Close Wallet…');gui.wait(cls='QMessageBox');gui.click(cls='QPushButton',text='Yes');waitfor(lambda:'Reference wallet' not in rpc('listwallets'))
    subprocess.run(['xdotool','key','alt+f','Home','Down','Right'],check=True);time.sleep(.2);gui.action('Reference wallet');waitfor(lambda:'Reference wallet' in rpc('listwallets'));subprocess.run(['xdotool','key','Escape','Escape'],check=True);choose('Reference wallet');gui.action('Transactions')
    xclick(gui.find(name='transactionView'),100,32,button=3)
    desktop('external-explorer-menu',['F16.S09','F31.S05'],'Transaction context menu includes the configured external explorer link. The endpoint is a recording test fixture.')
    tree()

def explorer_open():
    gui.action('Show in explorer.invalid');time.sleep(.8)
    records=[json.loads(s) for s in (ROOT/'logs/external-opens.jsonl').read_text().splitlines()];url=records[-1]['target'];txid=url.rsplit('/',1)[-1]
    check('external-explorer-transaction-link',['F16.S09','F31.S05'],'Explorer action substitutes the real selected transaction ID and dispatches it to the external handler.',[url.startswith('https://explorer.invalid/tx/'),len(txid),rpc('gettransaction',[txid],wallet='Reference wallet')['txid']],[True,64,txid])
    desktop('external-explorer-dispatch',['F16.S09','F31.S05'],'The external URL handler receives the selected transaction ID. This recording fixture does not contact a public block explorer.')
    subprocess.run(['pkill','-TERM','-f','^'+str(ROOT/'external-fixture')+' '],check=True)

if __name__=='__main__':
    scenario=sys.argv[1]
    gui=Driver()
    try:globals()[scenario]()
    except Exception:
        try:(ROOT/'logs'/f'{scenario}-failure-tree.json').write_text(json.dumps(gui.tree(all=True),indent=2))
        except Exception:pass
        traceback.print_exc();sys.exit(1)
