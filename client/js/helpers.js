if (typeof String.prototype.contains === 'undefined') {
    String.prototype.contains = function(it) {
        return this.indexOf(it) != -1;
    };
}
