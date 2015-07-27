rm -rf js-bundle/*
for i in js/exports/*; do 
	echo "building $i"
	(browserify $i || ~/node_modules/browserify/bin/cmd.js $i) > js-bundle/$(basename $i);
done;
