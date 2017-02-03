jQuery(document).ready(function($) {
    $('.testimonials-slider').unslider({
        autoplay: true,
        infinite: true,
        delay: 6000,
        arrows: {
            //  Unslider default behaviour
            prev: '<a class="unslider-arrow prev"><i class="fa fa-chevron-left fa-3x" aria-hidden="true"></i></a>',
            next: '<a class="unslider-arrow next"><i class="fa fa-chevron-right fa-3x" aria-hidden="true"></i></a>',
        }
    });
});
