'use strict';

var SketchupExport = function () {
    this.blocks = [];
};

SketchupExport.prototype.reset = function () {
    this.blocks = [];
};

SketchupExport.prototype.addBlock = function (points, level) {
    var block = new SketchupBlock(points, level);
    this.blocks.push(block)
};

SketchupExport.prototype.toScript = function () {
    var script = ["data:text;charset=utf-8,"];
    _.each(this.blocks, function (block, index) {
        script.push(block.toScript(index))
    });
    return script.join('\n')
};


var SketchupBlock = function (points, level) {
    this.points = points;
    this.level = _.clone(level)
};

SketchupBlock.prototype.toScript = function (index) {
    var script = ["ent" + index + " = Sketchup.active_model.entities"];
    script.push("main_face" + index + " = ent" + index + ".add_face " + _.map(this.points, function (point) {
        return "[" + point + "]"
    }));
    script.push("main_face" + index + ".reverse!");
    script.push("main_face" + index + ".pushpull " + this.level);
    return script.join('\n')
};
