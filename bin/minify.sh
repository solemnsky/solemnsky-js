for i in js-bundle/*; do
	closure-compiler --compilation_level ADVANCED $i > js-bundle/$(basename $i .js).min.js
done
