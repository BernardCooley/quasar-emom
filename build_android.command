cd ~/Desktop/workspace/quasar-emom
sudo quasar clean
sudo quasar build
sudo quasar build -m cordova -T android
cd src-cordova/
sudo cordova run android
exit