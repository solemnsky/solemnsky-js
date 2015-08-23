rm -rf js-bundle/*
for i in js/browser-exports/*; do 
	echo "building $i"
	(browserify $i || ~/node_modules/browserify/bin/cmd.js $i) > js-bundle/$(basename $i);
done;
