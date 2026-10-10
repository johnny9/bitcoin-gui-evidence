#!/usr/bin/env python3
"""Drive the external Widgets evidence bridge and record reproducible assertions."""
import datetime
import hashlib
import json
from pathlib import Path
import socket
import sys
import time

ROOT = Path('/work/reruns/20261010-widgets')

class Driver:
    def __init__(self, path=str(ROOT/'widgets.sock')):
        self.socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.socket.settimeout(20)
        self.socket.connect(path)
        self.stream = self.socket.makefile('rb')

    def send(self, cmd, **kwargs):
        request = {'cmd': cmd, **kwargs}
        self.socket.sendall((json.dumps(request) + '\n').encode())
        result = json.loads(self.stream.readline())
        with (ROOT/'logs/widgets-bridge.jsonl').open('a') as f:
            f.write(json.dumps({'utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'request':request, 'response':result})+'\n')
        if 'error' in result:
            raise RuntimeError(result['error'])
        return result

    def tree(self, all=False):
        return self.send('tree', all=all)['objects']

    def find(self, name=None, cls=None, text=None, visible=True):
        matches=[]
        for obj in self.tree(all=not visible):
            if name is not None and obj['name'] != name: continue
            if cls is not None and obj['class'] != cls: continue
            if text is not None and obj.get('text','').replace('&','') != text: continue
            matches.append(obj)
        if not matches: raise RuntimeError(f'Object missing: {name=}, {cls=}, {text=}')
        return sorted(matches,key=lambda obj:not obj.get('enabled',True))[0]

    def wait(self, name=None, cls=None, text=None, timeout=20):
        deadline=time.monotonic()+timeout
        while time.monotonic()<deadline:
            try: return self.find(name,cls,text)
            except RuntimeError: time.sleep(0.1)
        return self.find(name,cls,text)

    def action(self,text):
        self.send('action',id=self.find(cls='QAction',text=text)['id'])
        time.sleep(.25)

    def click(self,name=None,text=None,cls=None):
        obj=self.find(name,cls,text)
        if obj['class'] in ('QCheckBox','QRadioButton'):
            self.send('key',id=obj['id'],key=32)
        else:
            self.send('click',id=obj['id'])
        time.sleep(.2)

    def text(self,name,value): self.send('text',id=self.find(name=name)['id'],text=value)
    def get(self,name,prop): return self.send('get',id=self.find(name=name)['id'],property=prop)['value']
    def set(self,name,prop,value): return self.send('set',id=self.find(name=name)['id'],property=prop,value=value)
    def close(self,cls): self.send('close',id=self.find(cls=cls)['id']); time.sleep(.2)

    def capture(self,label,cls='BitcoinGUI',features=None,note='',name=None):
        time.sleep(.5)
        path=ROOT/'media/widgets'/f'{label}.png'
        self.send('capture',id=self.find(name=name,cls=None if name else cls)['id'],path=str(path))
        item={'path':str(path.relative_to(ROOT)), 'caption':label, 'features':features or [], 'note':note,
              'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
        manifest=ROOT/'media/widgets/captures.json'
        rows=json.loads(manifest.read_text()) if manifest.exists() else []
        rows=[r for r in rows if r['path']!=item['path']]+[item]
        manifest.write_text(json.dumps(rows,indent=2)+'\n')
        return item

if __name__=='__main__':
    gui=Driver()
    print(json.dumps(gui.send(**json.loads(sys.argv[1])),indent=2))
