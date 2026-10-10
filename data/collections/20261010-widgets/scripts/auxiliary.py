"""Native X11 captures of startup dialogs before the application test socket exists."""
import re,hashlib,json,os,subprocess,time
from capture_widgets import ROOT,check
import datetime
def desktop(name,features,caption):
    path=ROOT/"media/widgets"/(name+".png")
    ids=subprocess.check_output(["xdotool","search","--onlyvisible","--name","Welcome|Bitcoin Core"],text=True).splitlines()
    subprocess.run(["import","-window",ids[-1],str(path)],check=True)
    manifest=ROOT/"media/widgets/captures.json"
    rows=json.loads(manifest.read_text());rows=[r for r in rows if r["path"]!=str(path.relative_to(ROOT))]
    rows.append({"path":str(path.relative_to(ROOT)),"caption":caption,"features":features,"note":"Direct X11 window capture, without cropping or image edits.","utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"sha256":hashlib.sha256(path.read_bytes()).hexdigest()});manifest.write_text(json.dumps(rows,indent=2)+"\n")
os.environ['DISPLAY']=':98'
def window():
    ids=subprocess.check_output(['xdotool','search','--onlyvisible','--name','Bitcoin Core'],text=True).splitlines()
    return ids[-1]
def geometry(w):
    raw=subprocess.check_output(['xwininfo','-id',w],text=True)
    return {key:int(re.search(label+r':\s+(-?\d+)',raw).group(1)) for key,label in [('X','Absolute upper-left X'),('Y','Absolute upper-left Y'),('WIDTH','Width'),('HEIGHT','Height')]}

def click(w,dx,dy):
    g=geometry(w);subprocess.run(['xdotool','mousemove',str(g['X']+dx(g)),str(g['Y']+dy(g)),'click','1'],check=True);time.sleep(.3)
def run(mode,args):
    env={**os.environ,'DISPLAY':':98','XDG_CONFIG_HOME':str(ROOT/('config-'+mode)),'DBUS_SESSION_BUS_ADDRESS':'unix:path=/tmp/no-notification-service'}
    out=(ROOT/'logs'/f'{mode}.stdout').open('w');err=(ROOT/'logs'/f'{mode}.stderr').open('w')
    p=subprocess.Popen(['/work/widgets-build/bin/bitcoin-qt','-regtest','-listen=0','-networkactive=0','-dnsseed=0','-splash=0','-lang=en']+args,env=env,stdout=out,stderr=err)
    time.sleep(1.5)
    return p
p=run('choose-data-directory',['-choosedatadir'])
desktop('choose-data-directory',['F20.S01'],'First-run dialog offers the default or a custom data directory and explains disk space.')
subprocess.run(['xdotool','key','Escape'],check=True);code=p.wait(timeout=20);(ROOT/'logs/choose-data-directory.exit').write_text(str(code)+'\n')
base=ROOT/'settings-recovery';base.mkdir(exist_ok=True);bad=base/'invalid-settings.json';bad.write_text('{"incomplete": }\n');original=bad.read_bytes()
p=run('settings-abort',['-datadir='+str(base),'-settings='+str(bad)])
desktop('unreadable-settings-choices',['F27.S07','F30.S01','F30.S04','F25.S04'],'Unreadable settings trigger a critical dialog with Reset and Abort in a session without a notification service.')
w=window();click(w,lambda g:g['WIDTH']//2,lambda g:105)
desktop('unreadable-settings-details',['F27.S07','F30.S03'],'Expanded diagnostic details identify the settings parsing error.')
w=window();click(w,lambda g:g['WIDTH']-45,lambda g:105)
code=p.wait(timeout=20);(ROOT/'logs/settings-abort.exit').write_text(str(code)+'\n')
check('abort-preserves-settings',['F27.S07'],'Aborting startup leaves the invalid settings file byte-for-byte unchanged.',hashlib.sha256(bad.read_bytes()).hexdigest(),hashlib.sha256(original).hexdigest())
