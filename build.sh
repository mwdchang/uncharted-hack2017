################################################################################
# Quick and dirty script to build and pack cbsa-tops
################################################################################
echo "Starting build ... "
sleep 2
DT=`date +%Y%m%d`
PACKAGE="hack2017"

echo "Clean up previous build..."
echo "===================="
rm -rf $PACKAGE
rm -f $PACKAGE.tar.gz

echo "Creating directory structure..."
echo "===================="
mkdir -p $PACKAGE/ui
mkdir -p $PACKAGE/ui/build


echo "Building client and copying assets..."
echo "===================="
cd ./ui
npm run build
if [ $? -ne 0 ]
then
   echo 'Client build failed ... :( '
   exit
fi

cd ../


echo "Copying client distribution..."
echo "===================="
cp -r ./ui/build $PACKAGE/ui/


echo "Copying server files..."
echo "===================="
cp -v server.js $PACKAGE/server.js
cp -v distribution.json $PACKAGE/distribution.json
cp -v package.json $PACKAGE/package.json


echo "Creating tar.gz archive..."
tar -zcvf $PACKAGE.tar.gz $PACKAGE/




#echo "Make network copy"
# cp $PACKAGE.tar.gz //KRAKEN/cbsa/TOPS/dist/


echo "Cleanng up temp files ..."
rm -rf $PACKAGE

scp -i key.pem $PACKAGE.tar.gz ubuntu@10.64.16.97:

echo ""
echo "All done !!"
