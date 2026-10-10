import time
import capture_widgets as c
for n in range(100):
    try:c.gui=c.Driver();break
    except OSError:time.sleep(.02)
try:
    splash=c.gui.wait(cls='SplashScreen',timeout=3)
    c.immediate_capture('initialization-progress',splash,['F27.S03'],'The real startup splash reports initialization progress.')
except Exception as error:print('Splash was too brief:',error)
c.gui.wait(cls='BitcoinGUI',timeout=90)
