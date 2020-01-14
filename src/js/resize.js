module.exports = function (option) {
    function resize() {
        // if(!window.hzapp_data_isPhone){
        //   return resize_pc();
        // }
        //在750px宽度 1rem=40px;
        var baseFontSize = 40;
        var baseWidth = 750;
        var maxWidth = 750;

        var clientWidth = window.document.documentElement.clientWidth || window.innerWidth;
        // var innerWidth = Math.max(Math.min(clientWidth, 480), 320);
        clientWidth = clientWidth || 750;
        if (!window.hzapp_data_isPhone && clientWidth > maxWidth) {
            clientWidth = maxWidth;
        }
        var rem = (clientWidth / baseWidth) * baseFontSize;
        window.__baseRem = rem;

        window.document.documentElement.style.fontSize = rem + 'px';
    }
    // function resize_pc() {
    //     window.document.documentElement.style.fontSize = 20 + 'px';
    // }
    resize();
    window.onresize = resize;
}