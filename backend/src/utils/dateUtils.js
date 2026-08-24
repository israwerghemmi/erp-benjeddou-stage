function estDateValide(dateStr) {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}
function estDateFuture(dateStr) {
    const date = new Date(dateStr);
    return date > new Date();
}
module.exports = { estDateValide, estDateFuture };
