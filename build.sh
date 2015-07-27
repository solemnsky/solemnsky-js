for i in js/exports/*; do 
	(browserify $i || ~/node_modules/browserify/bin/cmd.js $i) > js-bundle/$(basename $i);
done;
	
