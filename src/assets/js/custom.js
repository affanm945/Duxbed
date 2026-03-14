/* =====================================
All JavaScript fuctions Start
======================================*/
(function ($) {

	'use strict';
	/*--------------------------------------------------------------------------------------------
		document.ready ALL FUNCTION START
	---------------------------------------------------------------------------------------------*/

	// > Video responsive function by = custom.js ========================= //	
	function video_responsive() {
		jQuery('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
		jQuery('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
	}

	// Category function by = owl.js **********//
	function twm_category_carousal() {
		jQuery('.twm-category-carousal-slider').owlCarousel({
			loop: true,
			margin: 30,
			center: false,
			nav: false,
			dots: false,
			autoWidth: true,
			autoplay: true,
			slideTransition: 'linear',
			autoplayTimeout: 5000,
			autoplaySpeed: 5000,
			navText: ['<i class="bi bi-arrow-left"></i>', '<i class="bi bi-arrow-right"></i>']
		});
	}

	// Services function by = owl.js **********//
	function twm_servi_carousal() {
		jQuery('.twm-servi-carousal-slider').owlCarousel({
			loop: true,
			margin: 30,
			center: false,
			nav: false,
			dots: false,
			autoWidth: false,
			autoplay: true,
			slideTransition: 'linear',
			autoplayTimeout: 5000,
			autoplaySpeed: 5000,
			responsiveClass: true,
			responsive: {
				0: {
					items: 1,
				},
				640: {
					items: 2,
				},
				991: {
					items: 2
				},
				1024: {
					items: 3
				},
				1366: {
					items: 3
				},
				1400: {
					items: 4
				}
			},
			navText: ['<i class="bi bi-arrow-left"></i>', '<i class="bi bi-arrow-right"></i>']
		});
	}

	// Blog List function by = owl.js **********//

	//  Blog List function by = swiper-bundle.min.js ========================== //
	function twm_blog_list_carousal() {
		var swiper = new Swiper(".twm-blog-list-carousal", {
			slidesPerView: 1,
			spaceBetween: 1,
			spaceBetween: 10,
			loop: true,
			autoplay: {
				delay: 2500,
				disableOnInteraction: false,
			},
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev",
			},

		});
	}

	// Project single Page SLider function by = owl.js **********//
	function project_single_img_slider() {
		jQuery('.project-single-img-slider').owlCarousel({
			loop: true,
			margin: 30,
			center: false,
			nav: false,
			dots: false,
			autoWidth: false,
			autoplay: true,
			slideTransition: 'linear',
			autoplayTimeout: 5000,
			autoplaySpeed: 5000,
			responsiveClass: true,
			responsive: {
				0: {
					items: 2,
					margin: 5,
				},
				575: {
					items: 3,
					margin: 10,
				},
				1024: {
					items: 4
				}
			},
			navText: ['<i class="bi bi-arrow-left"></i>', '<i class="bi bi-arrow-right"></i>']
		});
	}

	// Related Slider function by = owl.js **********//
	function related_project_slider() {
		jQuery('.related-project-slider').owlCarousel({
			loop: true,
			margin: 30,
			center: false,
			nav: false,
			dots: false,
			autoWidth: false,
			autoplay: true,
			slideTransition: 'linear',
			autoplayTimeout: 5000,
			autoplaySpeed: 5000,
			responsiveClass: true,
			responsive: {
				0: {
					items: 1,
				},
				768: {
					items: 2,
				},
				1024: {
					items: 3,
				},
				1200: {
					items: 4
				}
			},
			navText: ['<i class="bi bi-arrow-left"></i>', '<i class="bi bi-arrow-right"></i>']
		});
	}


	// Category function by = owl.js **********//
	function twm_category_carousal_2() {
		jQuery('.twm-category-carousal-slider2').owlCarousel({
			loop: true,
			margin: 30,
			center: false,
			nav: false,
			rtl: true,
			dots: false,
			autoWidth: true,
			autoplay: true,
			slideTransition: 'linear',
			autoplayTimeout: 5000,
			autoplaySpeed: 5000,
			navText: ['<i class="bi bi-arrow-left"></i>', '<i class="bi bi-arrow-right"></i>']
		});
	}

	// > LIGHTBOX Gallery Popup function	by = lc_lightbox.lite.js =========================== //      
	function lightbox_popup() {
		try {
			// Only initialize on elements that exist and are not React components
			var lightboxElements = jQuery('.elem').filter(function () {
				// Only process elements that are actual image links or have data-lcl attributes
				var $this = jQuery(this);
				return $this.is('img') || $this.is('a[href*=".jpg"], a[href*=".png"], a[href*=".gif"], a[href*=".jpeg"]') || $this.attr('data-lcl-thumb');
			});

			if (lightboxElements.length === 0) {
				return; // No valid elements found, skip initialization
			}

			if (typeof lc_lightbox === 'undefined') {
				return; // lc_lightbox library not loaded
			}

			lc_lightbox(lightboxElements, {
				wrap_class: 'lcl_fade_oc',
				gallery: true,
				thumb_attr: 'data-lcl-thumb',

				skin: 'minimal',
				radius: 0,
				padding: 0,
				border_w: 0,
			});
		} catch (error) {
			console.warn('Lightbox initialization skipped:', error);
		}
	}

	// > magnificPopup for video function	by = magnific-popup.js ===================== //	
	function magnific_video() {
		jQuery('.mfp-video').magnificPopup({
			type: 'iframe',
		});
	}

	// Vertically center Bootstrap modal popup function by = custom.js ==============//
	function popup_vertical_center() {
		jQuery(function () {
			function reposition() {
				var modal = jQuery(this),
					dialog = modal.find('.modal-dialog');
				modal.css('display', 'block');

				// Dividing by two centers the modal exactly, but dividing by three 
				// or four works better for larger screens.
				dialog.css("margin-top", Math.max(0, (jQuery(window).height() - dialog.height()) / 2));
			}
			// Reposition when a modal is shown
			jQuery('.modal').on('show.bs.modal', reposition);
			// Reposition when the window is resized
			jQuery(window).on('resize', function () {
				jQuery('.modal:visible').each(reposition);
			});
		});
	}

	// > Main menu sticky on top  when scroll down function by = custom.js ========== //		
	$(window).scroll(function () {
		if ($(this).scrollTop() > 50) {
			$('.sticky-header').addClass('is-fixed');
		} else {
			$('.sticky-header').removeClass('is-fixed');
		}
	});

	// > Sidebar sticky  when scroll down function by = theia-sticky-sidebar.js ========== //		
	function sticky_sidebar() {
		$('.rightSidebar')
			.theiaStickySidebar({
				additionalMarginTop: 100
			});
	}


	// > page scroll top on button click function by = custom.js ===================== //	
	function scroll_top() {
		// Use delegation so buttons added by React (e.g. after route change) always work
		jQuery(document).off('click.scroltop', 'button.scroltop').on('click.scroltop', 'button.scroltop', function (e) {
			e.preventDefault();
			jQuery("html, body").animate({
				scrollTop: 0
			}, 1000);
			return false;
		});

		jQuery(window).on("scroll", function () {
			var scroll = jQuery(window).scrollTop();
			if (scroll > 900) {
				jQuery("button.scroltop").fadeIn(1000);
			} else {
				jQuery("button.scroltop").fadeOut(1000);
			}
		});
	}

	// > input type file function by = custom.js ========================== //	 	 
	function input_type_file_form() {
		jQuery(document).on('change', '.btn-file :file', function () {
			var input = jQuery(this),
				numFiles = input.get(0).files ? input.get(0).files.length : 1,
				label = input.val().replace(/\\/g, 'https://thewebmax.org/').replace(/.*\//, '');
			input.trigger('fileselect', [numFiles, label]);
		});

		jQuery('.btn-file :file').on('fileselect', function (event, numFiles, label) {
			var input = jQuery(this).parents('.input-group').find(':text'),
				log = numFiles > 10 ? numFiles + ' files selected' : label;
			if (input.length) {
				input.val(log);
			} else {
				if (log) alert(log);
			}
		});
	}

	// > input Placeholder in IE9 function by = custom.js ======================== //	
	function placeholderSupport() {
		/* input placeholder for ie9 & ie8 & ie7 */
		jQuery.support.placeholder = ('placeholder' in document.createElement('input'));
		/* input placeholder for ie9 & ie8 & ie7 end*/
		/*fix for IE7 and IE8  */
		if (!jQuery.support.placeholder) {
			jQuery("[placeholder]").on('focus', function () {
				if (jQuery(this).val() === jQuery(this).attr("placeholder")) jQuery(this).val("");
			}).blur(function () {
				if (jQuery(this).val() === "") jQuery(this).val(jQuery(this).attr("placeholder"));
			}).blur();

			jQuery("[placeholder]").parents("form").on('submit', function () {
				jQuery(this).find('[placeholder]').each(function () {
					if (jQuery(this).val() === jQuery(this).attr("placeholder")) {
						jQuery(this).val("");
					}
				});
			});
		}
		/*fix for IE7 and IE8 end */
	}

	// > footer fixed on bottom function by = custom.js ======================== //	
	function footer_fixed() {
		jQuery('.site-footer').css('display', 'block');
		jQuery('.site-footer').css('height', 'auto');
		var footerHeight = jQuery('.site-footer').outerHeight();
		jQuery('.footer-fixed > .page-wraper').css('padding-bottom', footerHeight);
		jQuery('.site-footer').css('height', footerHeight);
	}

	// > accordion active calss function by = custom.js ========================= //	
	function accordion_active() {
		$('.acod-head a').on('click', function () {
			$('.acod-head').removeClass('acc-actives');
			$(this).parents('.acod-head').addClass('acc-actives');
			$('.acod-title').removeClass('acc-actives'); //just to make a visual sense
			$(this).parent().addClass('acc-actives'); //just to make a visual sense
			($(this).parents('.acod-head').attr('class'));
		});
	}

	// > Nav submenu show hide on mobile by = custom.js
	function mobile_nav() {
		jQuery(".sub-menu").parent('li').addClass('has-child');
		jQuery(".has-child").each(function () {

			if (jQuery(this).children(".submenu-toogle").length === 0) {

				jQuery("<div class='submenu-toogle bi bi-chevron-down'></div>")
					.insertAfter(jQuery(this).children("a"));

			}

		});
		jQuery(document).off('click', '.has-child > .submenu-toogle');

		jQuery(document).on('click', '.has-child > .submenu-toogle', function (ev) {

			let parent = jQuery(this).parent();
			parent.siblings(".has-child")
				.removeClass('nav-active')
				.children(".sub-menu").slideUp(300);

			parent.toggleClass('nav-active');
			parent.children(".sub-menu").slideToggle(300);

			ev.stopPropagation();
		});
	}

	// // Mobile side drawer function by = custom.js
	function mobile_side_drawer() {
		jQuery('#mobile-side-drawer').on('click', function () {
			var menu = jQuery('.mobile-sider-drawer-menu');
			var isOpening = !menu.hasClass('active');
			menu.toggleClass('active');
			// Re-inject submenu chevron icons when opening (they can be lost after React re-renders on nav)
			if (isOpening) {
				mobile_nav();
			}
		});
	}

	//  > Top Search bar Show Hide function by = custom.js =================== //	

	function site_search() {
		jQuery('a[href="#search"]').on('click', function (event) {
			jQuery('#search').addClass('open');
			jQuery('#search > form > input[type="search"]').focus();
		});

		jQuery('#search, #search .close-btn').on('click keyup', function (event) {
			if (event.target === this || event.target.className === 'close-btn') {
				jQuery(this).removeClass('open');
			}
		});
	}

	// Home page Testimonial 1 Slider function by = owl.carousel.js ========================== //
	function testimonial_1_content() {
		// Skip elements that are managed by React
		var testimonialCarousel = jQuery('.testimonial-1-content').not('[data-react-carousel="true"]');
		if (testimonialCarousel.length === 0) {
			return; // No elements to initialize (React is managing them)
		}
		testimonialCarousel.owlCarousel({
			loop: true,
			autoplay: true,
			nav: true,
			dots: false,
			margin: 30,

			rewind: false, /* use rewind if you don't want loop */
			/*
			animateOut: 'fadeOut',
			animateIn: 'fadeIn',
			*/
			responsiveClass: true,
			autoHeight: false,
			autoplayTimeout: 7000,
			smartSpeed: 800,

			navText: ['<i class="flaticon-angle-pointing-to-left"></i>', '<i class="flaticon-angle-arrow-pointing-to-right"></i>'],
			responsive: {

				0: {
					items: 1,
				},
				1024: {
					items: 2
				}
			}
		});
	}

	//  Shop Product Price Range Slider function by = bootstrap-slider.min.js ========================== //
	function shop_product_price() {
		jQuery("#ex2").slider({});
	}


	// > TouchSpin box function by  = jquery.bootstrap-touchspin.js =============== // 
	function input_number_vertical_form() {
		var touchSpinInputs = jQuery("input[name='demo_vertical2']");
		if (touchSpinInputs.length === 0) {
			return; // No elements found, skip initialization
		}
		if (typeof jQuery.fn.TouchSpin === 'undefined') {
			return; // TouchSpin plugin not loaded, skip initialization
		}
		touchSpinInputs.TouchSpin({
			verticalbuttons: true,
			verticalupclass: 'bi bi-plus-lg',
			verticaldownclass: 'bi bi-dash-lg'
		});
	}

	//  Counter Section function by = counterup.min.js
	function counter_section() {
		jQuery('.counter').counterUp({
			delay: 10,
			time: 3000
		});
	}

	//  Client logo Carousel function by = owl.carousel.js ========================== //
	function home_client_carousel_2() {
		var swiper = new Swiper(".home-client-carousel2", {
			slidesPerView: 1,
			spaceBetween: 10,
			loop: true,
			autoplay: {
				delay: 1500,
				disableOnInteraction: false,
			},
			pagination: {
				el: ".swiper-pagination  .home-client-carousel2",
				clickable: true,
				dynamicBullets: true,
			},
			breakpoints: {
				0: {
					slidesPerView: 2,
				},
				640: {
					slidesPerView: 2,
				},
				768: {
					slidesPerView: 4,
				},
				1024: {
					slidesPerView: 7,
				},
			},
		});
	}

	//  Client logo Carousel function by = owl.carousel.js ========================== //
	function home_client_carousel() {
		// Skip initialization if React is managing this carousel
		var carouselElement = document.querySelector(".home-client-carousel");
		if (carouselElement && (carouselElement.hasAttribute('data-react-carousel') || carouselElement.getAttribute('data-react-carousel') === 'true')) {
			return;
		}

		var swiper = new Swiper(".home-client-carousel", {
			slidesPerView: 1,
			spaceBetween: 5,
			loop: true,
			autoplay: {
				delay: 1500,
				disableOnInteraction: false,
			},
			breakpoints: {
				0: {
					slidesPerView: 2,
				},
				480: {
					slidesPerView: 3,
				},
				767: {
					slidesPerView: 4,
				},
				1000: {
					slidesPerView: 6,
				},
			},
		});
	}


	//  Testimonial Carousel function by = swiper-bundle.min.js ========================== //
	function twm_t_monial_2_slider() {
		var swiper = new Swiper(".twm-t-monial-2-slider", {
			slidesPerView: 3,
			spaceBetween: 30,
			loop: true,
			autoplay: {
				delay: 2500,
				disableOnInteraction: false,
			},
			pagination: {
				el: ".swiper-pagination  .testimonial-2-content",
				clickable: true,
				dynamicBullets: true,
			},
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev",
			},
			breakpoints: {
				0: {
					slidesPerView: 1,
				},
				480: {
					slidesPerView: 1,
				},
				991: {
					slidesPerView: 1,
				},
				1024: {
					slidesPerView: 2,
				},
			},
		});
	}

	// > projects Thumb SLider Full Screen with no margin function by = swiper-bundle.min.js ========================== //
	function product_thumb_slider() {
		var swiper = new Swiper(".product-SW-view", {
			loop: true,
			spaceBetween: 2,
			slidesPerView: 4,
			freeMode: true,
			watchSlidesVisibility: true,
			watchSlidesProgress: true,
		});
		var swiper2 = new Swiper(".product-SW-view2", {
			loop: true,
			spaceBetween: 10,
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev",
			},
			thumbs: {
				swiper: swiper,
			},
		});
	}


	//-------- Home 1 Slider------------//
	function slider_home_one() {

		var swiper2 = new Swiper(".twm-slider1", {
			thumbs: { swiper: swiper, },
			slidesPerView: 1,
			speed: 3000,
			parallax: true,
			freeMode: false,
			loop: true,
			grabCursor: true,
			effect: "creative",
			creativeEffect: {
				prev: {
					shadow: false,
					translate: ["-120%", 0, -500],
				},
				next: {
					shadow: false,
					translate: ["120%", 0, -500],
				},
			},
			autoplay: {
				delay: 2500,
				disableOnInteraction: false
			},
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev",
			},

			scrollbar: {
				el: ".swiper-scrollbar",
				hide: false,

			},
			pagination: {
				el: ".swiper-pagination",
				type: "fraction",
			},
		});

		var swiper = new Swiper(".twm-slider1-content", {
			slidesPerView: 1,
			speed: 3000,
			parallax: true,
			freeMode: false,
			loop: true,
			grabCursor: true,
			autoplay: {
				delay: 2500,
				disableOnInteraction: false
			},
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev",
			},

			scrollbar: {
				el: ".swiper-scrollbar",
				hide: false,

			},
			pagination: {
				el: ".swiper-pagination",
				type: "fraction",
			},

		});

	}

	//-------- Home 2 Slider------------//
	function slider_home_two() {
		const swiper = new Swiper(".hvillas-sl-2", {
			//effect: "coverflow",
			grabCursor: true,
			slidesPerView: 2,
			slidesPerGroup: 1,
			centeredSlides: true,
			spaceBetween: 10,
			mousewheel: {
				forceToAxis: true
			},
			coverflowEffect: {
				rotate: 0,
				stretch: 0,
				depth: 100,
				modifier: 3,
				slideShadows: false,
			},
			keyboard: {
				enabled: true,
			},
			loop: true,
			autoplay: {
				delay: 3000,
				disableOnInteraction: false,
			},
			breakpoints: {
				0: {
					slidesPerView: 1,
				},
				640: {
					slidesPerView: 2,
				},
				768: {
					slidesPerView: 2,
				},
				1024: {
					slidesPerView: 2,
				},
				1560: {
					slidesPerView: 2,
				},
			},
			speed: 700,
			slideActiveClass: "is-active",
			slideDuplicateActiveClass: "is-active"

		});
	}

	//-------- ACDion Function ------------//
	function ACDion() {

		// HIBR LITE acd-bx
		// On load, add the background image
		var aBgimage = $('.acd-bx').data('background');
		$('.acd-bx').css('background-image', 'url(' + aBgimage + ')');


		$('.section').on('click', function (e) {

			if ($(this).hasClass('open')) {

				e.stopPropagation();
				$('.acd-bx').removeClass('enabled')
				$('.section').removeClass('open')

			} else {

				$(this).parent('.acd-bx').addClass('enabled')
				$(this).addClass('open')
				$(this).siblings('.section').removeClass('open')

				var bGimage = $(this).data('background')
				$('.acd-bx').css('background-image', 'url(' + bGimage + ')');

			}


		})

		$('.close').on('click', function (e) {
			e.stopPropagation();
			$('.acd-bx').removeClass('enabled')
			$('.section').removeClass('open')
		})

	}


	//  Cursor Section Start function by = gsap.min.js **********//
	function Cursor_section() {
		let cursor = document.querySelector(".cursor");
		let cursor2 = document.querySelector(".cursor2");
		if (!cursor || !cursor2) return; // Only run on pages that have cursor elements (e.g. Home)
		let cursorScale = document.querySelectorAll(".cursor-scale");
		let mouseX = 0;
		let mouseY = 0;

		gsap.to({}, 0.016, {
			repeat: -1,
			onRepeat: function () {
				gsap.set(cursor, {
					css: {
						left: mouseX,
						top: mouseY,
					},
				});
				gsap.set(cursor2, {
					css: {
						left: mouseX,
						top: mouseY,
					},
				});
			},
		});

		// Mouse Pointer

		window.addEventListener("mousemove", (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		});

		cursorScale.forEach((link) => {
			link.addEventListener("mousemove", () => {
				cursor.classList.add("grow");
				if (link.classList.contains("small")) {
					cursor.classList.remove("grow");
					cursor.classList.add("grow-small");
				}
			});

			link.addEventListener("mouseleave", () => {
				cursor.classList.remove("grow");
				cursor.classList.remove("grow-small");
			});
		});
	}


	// > Start projects Filter with Slider function by = swiper-bundle.min.js ========================== //
	if (jQuery('.pro-filtr-cate-bx').length) {
		const config = {
			pagination: ".swiper-pagination",
			slidesPerView: 1,
			slidesPerColumn: 1,
			paginationClickable: true,
			spaceBetween: 20,
			autoHeight: false,
			centerInsufficientSlides: true,
			centeredSlidesBounds: true,
			cssMode: false,
			mousewheel: false,
			keyboard: false,
			speed: 3000,
			parallax: true,
			freeMode: true,
			loop: true,
			grabCursor: true,
			autoplay: {
				delay: 1500,
				disableOnInteraction: false,
			},
			breakpoints: {
				0: {
					slidesPerView: 1,
					slidesPerGroup: 1,
					slidesPerColumn: 1,
					spaceBetween: 20
				},
				575: {
					slidesPerView: 2,
					slidesPerGroup: 1,
					slidesPerColumn: 1,
					spaceBetween: 30
				},
				991: {
					slidesPerView: 3,
					slidesPerGroup: 1,
					slidesPerColumn: 1,
					spaceBetween: 30
				},
				1366: {
					slidesPerView: 4,
					slidesPerGroup: 1,
					slidesPerColumn: 1,
					spaceBetween: 40
				}
			},
			// If we need pagination
			pagination: {
				el: ".swiper-pagination",
				type: "fraction"
			},
			// Navigation arrows
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev"
			},

			// And if we need scrollbar
			scrollbar: {
				el: '.swiper-scrollbar',
			},
		};
		var swiper = new Swiper(".pro-filtr-cate-bx", config);
		const filters = document.querySelectorAll(".pro-filtr-cate-carousal span");
		function updateFilter(activeFilter) {
			const filters = document.querySelectorAll(".pro-filtr-cate-carousal span");
			if (!activeFilter) {
				filters[0].classList.add("active");
				activeFilter = filters[0];
			}
			const filter = activeFilter.innerText.toLowerCase();
			Array.prototype.forEach.call(filters, function (el) {
				if (el === activeFilter) {
					el.classList.add("active");
				} else {
					el.classList.remove("active");
				}
			});
		}
		Array.prototype.forEach.call(filters, function (_filter) {
			_filter.addEventListener("click", function (e) {
				const self = e.target;
				const filter = self.getAttribute("data-filter").toLowerCase();
				updateFilter(self);
				console.log("filter:", filter);
				if (filter == "all") {
					Array.prototype.forEach.call(
						document.querySelectorAll(".pro-filtr-cate-bx [data-filter]"),
						function (_item) {
							_item.classList.remove("non-swiper-slide");
							_item.classList.add("swiper-slide");
						}
					);
					swiper.destroy();
					swiper = new Swiper(".pro-filtr-cate-bx", config);
				} else {
					Array.prototype.forEach.call(
						document.querySelectorAll(
							".pro-filtr-cate-bx [data-filter]:not([data-filter='" + filter + "'])"
						),
						(el) => {
							el.classList.add("non-swiper-slide");
							el.classList.remove("swiper-slide");
							el.removeAttribute("style");
						}
					);
					Array.prototype.forEach.call(
						document.querySelectorAll(
							".pro-filtr-cate-bx [data-filter='" + filter + "']"
						),
						(el) => {
							el.classList.remove("non-swiper-slide");
							el.classList.add("swiper-slide");
							el.removeAttribute("style");
						}
					);
					swiper.destroy();
					swiper = new Swiper(".pro-filtr-cate-bx", config);
				}
			});
		});
		updateFilter(null);
	}
	// > End projects Filter with Slider function by = swiper-bundle.min.js ========================== //


	// > Sidebar Popup function **********//
	jQuery(document).ready(function (o) {
		0 < o(".offset-side-bar").length &&
			o(".offset-side-bar").on("click", function (e) {
				e.preventDefault(), e.stopPropagation(), o(".cart-group").addClass("isActive");
			}),
			0 < o(".close-side-widget").length &&
			o(".close-side-widget").on("click", function (e) {
				e.preventDefault(), o(".cart-group").removeClass("isActive");
			}),
			0 < o(".navSidebar-button").length &&
			o(".navSidebar-button").on("click", function (e) {
				e.preventDefault(), e.stopPropagation(), o(".info-group").addClass("isActive");
			}),
			0 < o(".close-side-widget").length &&
			o(".close-side-widget").on("click", function (e) {
				e.preventDefault(), o(".info-group").removeClass("isActive");
			}),
			o("body").on("click", function (e) {
				o(".info-group").removeClass("isActive"), o(".cart-group").removeClass("isActive");
			}),
			o(".xs-sidebar-widget").on("click", function (e) {
				e.stopPropagation();
			}),
			0 < o(".xs-modal-popup").length &&
			o(".xs-modal-popup").magnificPopup({
				type: "inline",
				fixedContentPos: !2,
				fixedBgPos: !0,
				overflowY: "auto",
				closeBtnInside: !2,
				callbacks: {
					beforeOpen: function () {
						this.st.mainClass = "my-mfp-slide-bottom xs-promo-popup";
					},
				},
			});
	});


	/** ====================================================================END */


	/*--------------------------------------------------------------------------------------------
		Window on load ALL FUNCTION START
	---------------------------------------------------------------------------------------------*/

	// > masonry function function by = isotope.pkgd.min.js ========================= //	
	function masonryBox() {
		if (jQuery().isotope) {
			var $container = jQuery('.masonry-wrap');

			$container.isotope({
				itemSelector: '.masonry-item',
				transitionDuration: '1s',
				originLeft: true,
				stamp: '.stamp',
				percentPosition: true,
				layoutMode: 'masonry',
			});

			$container.imagesLoaded().progress(function () {
				$container.isotope('layout');
			});

			jQuery('.masonry-filter li').on('click', function () {
				var selector = jQuery(this).find("a").attr('data-filter');
				jQuery('.masonry-filter li').removeClass('active');
				jQuery(this).addClass('active');
				$container.isotope({ filter: selector });
				return false;
			});
		};
	}

	// > page loader function by = custom.js ========================= //		
	function page_loader() {
		$('.loading-area').fadeOut(1500);
	}

	//Wow Animation
	function wow_animation() {
		new WOW().init();
		var wow = new WOW(
			{
				animateClass: 'animated',
				offset: 100,
				callback: function (box) {
					// console.log("WOW: animating <" + box.tagName.toLowerCase() + ">")
				}
			}
		);
		wow.init();
	}
	// > skills bar function function by  = custom.js ========================= //

	/* 2.2 skills bar widths*/

	function progress_bar_width() {
		jQuery(window).on('scroll', function () {
			jQuery(".progress-bar").each(function () {
				progress_bar_width = jQuery(this).attr('aria-valuenow');
				jQuery(this).width(progress_bar_width + '%');
			});
		});
	}

	/*--------------------------------------------------------------------------------------------
		Window on scroll ALL FUNCTION START
	---------------------------------------------------------------------------------------------*/

	function color_fill_header() {
		var scroll = $(window).scrollTop();
		if (scroll >= 100) {
			$(".is-fixed").addClass("color-fill");
		} else {
			$(".is-fixed").removeClass("color-fill");
		}
	}


	/*--------------------------------------------------------------------------------------------
		document.ready ALL FUNCTION START
	---------------------------------------------------------------------------------------------*/
	jQuery(document).ready(function () {
		// > Top Search bar Show Hide function by = custom.js  		
		site_search(),
			// > Video responsive function by = custom.js 
			video_responsive(),
			// Category function by = owl.js **********//
			twm_category_carousal(),
			// Services function by = owl.js **********//
			twm_servi_carousal(),
			//  Blog List function by = swiper-bundle.min.js ========================== //
			twm_blog_list_carousal(),
			// Project single Page SLider function by = owl.js **********//
			project_single_img_slider(),
			// Related Slider function by = owl.js **********//
			related_project_slider(),
			// Category function by = owl.js **********//
			twm_category_carousal_2(),
			// > LIGHTBOX Gallery Popup function	by = lc_lightbox.lite.js =========================== //      
			lightbox_popup(),
			// > magnificPopup for video function	by = magnific-popup.js
			magnific_video(),
			// > Vertically center Bootstrap modal popup function by = custom.js
			popup_vertical_center();
		// > Sidebar sticky  when scroll down function by = theia-sticky-sidebar.js ========== //		
		sticky_sidebar(),
			// > page scroll top on button click function by = custom.js	
			scroll_top(),
			// > input type file function by = custom.js	 	
			input_type_file_form(),
			// > input Placeholder in IE9 function by = custom.js		
			placeholderSupport(),
			// > footer fixed on bottom function by = custom.js	
			footer_fixed(),
			// > accordion active calss function by = custom.js ========================= //			
			accordion_active(),
			// > Nav submenu on off function by = custome.js ===================//
			mobile_nav(),
			// Mobile side drawer function by = custom.js
			mobile_side_drawer(),
			// Home page Testimonial 1 Slider function by = owl.carousel.js ========================== //
			testimonial_1_content(),
			//  Client logo Carousel function by = owl.carousel.js ========================== //
			home_client_carousel(),
			//  Testimonial Carousel function by = swiper-bundle.min.js ========================== //
			twm_t_monial_2_slider(),
			//  Client logo Carousel function by = owl.carousel.js ========================== //
			home_client_carousel_2(),
			//  Shop Product Price Range Slider function by = bootstrap-slider.min.js ========================== //
			shop_product_price(),
			// > TouchSpin box function by  = jquery.bootstrap-touchspin.js =============== // 
			input_number_vertical_form(),
			//  Counter Section function by = counterup.min.js ========================== //
			counter_section(),
			// > projects Thumb SLider Full Screen with no margin function by = swiper-bundle.min.js ========================== //
			product_thumb_slider(),
			// Home 1 Slider (disabled for React home page to avoid DOM conflicts)
			// slider_home_one(),
			//-------- Home 2 Slider------------//
			slider_home_two(),
			//-------- ACDion Function ------------//
			ACDion(),
			//  Cursor Section Start function by = gsap.min.js **********//
			Cursor_section(),
			//Wow Animation
			wow_animation(),
			/* 2.2 skills bar widths*/
			progress_bar_width()

	});

	/*--------------------------------------------------------------------------------------------
		Window Load START
	---------------------------------------------------------------------------------------------*/
	jQuery(window).on('load', function () {

		// > masonry function function by = isotope.pkgd.min.js		
		masonryBox(),
			// > page loader function by = custom.js		
			page_loader();

	});

	/*===========================
	   Window Scroll ALL FUNCTION START
   ===========================*/

	jQuery(window).on('scroll', function () {
		// > Window on scroll header color fill 
		color_fill_header();
	});

	/*===========================
		Window Resize ALL FUNCTION START
	===========================*/

	jQuery(window).on('resize', function () {
		// > footer fixed on bottom function by = custom.js		 
		footer_fixed();
	});

	/*===========================
		Document on  Submit FUNCTION START
	===========================*/

	// > Contact form function by = custom.js	
	jQuery(document).on('submit', 'form.cons-contact-form', function (e) {
		e.preventDefault();
		var form = jQuery(this);
		/* sending message */
		jQuery.ajax({
			url: 'https://ifahome.in/contact-mail.php',

			data: form.serialize() + "&action=contactform",
			type: 'POST',
			dataType: 'JSON',
			beforeSend: function () {
				jQuery('.loading-area').hide();
			},

			success: function (data) {
				jQuery('.loading-area').hide();
				if (data['success']) {
					jQuery("<div class='alert alert-success'>" + data['message'] + "</div>").insertBefore('form.cons-contact-form');
				} else {
					jQuery("<div class='alert alert-danger'>" + data['message'] + "</div>").insertBefore('form.cons-contact-form');
				}
			}
		});
		jQuery('.cons-contact-form').trigger("reset");
		return false;
	});

	/*===========================
		Document on  Submit FUNCTION END
	===========================*/
	/*360 Degree Text Function Start*/
	if (jQuery('.emblem').length) {
		var Emblem = {
			init: function (el, str) {
				var element = document.querySelector(el);
				var text = str ? str : element.innerHTML;
				element.innerHTML = '';
				for (var i = 0; i < text.length; i++) {
					var letter = text[i];
					var span = document.createElement('span');
					var node = document.createTextNode(letter);
					var r = (360 / text.length) * (i);
					var x = (Math.PI / text.length).toFixed(0) * (i);
					var y = (Math.PI / text.length).toFixed(0) * (i);
					span.appendChild(node);
					span.style.webkitTransform = 'rotateZ(' + r + 'deg) translate3d(' + x + 'px,' + y + 'px,0)';
					span.style.transform = 'rotateZ(' + r + 'deg) translate3d(' + x + 'px,' + y + 'px,0)';
					element.appendChild(span);
				}
			}
		};

		Emblem.init('.emblem');
	}
	/*360 Degree Text Function End*/

	/*On scroll show project images function Start*/
	if (typeof window.IntersectionObserver !== 'undefined') {
		let options = {
			threshold: [0.5, 1]
		}
		const targets = document.querySelectorAll('.cb');
		function handleIntersection(entries) {
			entries.map((entry) => {
				if (entry.isIntersecting) {
					entry.target.current = entry.target.dataset.swap;
					const element = document.querySelector(".locker__container ." + entry.target.current);
					if (element != null || element !== 'undefined') {
						element.classList.add("active");
					}
				} else {
					const element = document.querySelector(".locker__container ." + entry.target.current);
					if (element != null & element !== 'undefined') {
						element.classList.remove("active");
					}
				}
			});
		}
		const observer = new IntersectionObserver(handleIntersection, options);
		targets.forEach(target => observer.observe(target));
	} else {
	}
	/*On scroll show project images function End*/


	//*On hover Image show Function *//
	const link = document.querySelectorAll('.twm-achi-bx-conent');
	const linkHoverReveal = document.querySelectorAll('.hover-reveal');
	const linkImages = document.querySelectorAll('.hidden-img');

	for (let i = 0; i < link.length; i++) {
		link[i].addEventListener('mousemove', (e) => {
			linkHoverReveal[i].style.opacity = 1;
			linkHoverReveal[i].style.transform = `translate(-170%, -50% ) rotate(5deg)`;
			linkImages[i].style.transform = 'scale(1, 1)';
			linkHoverReveal[i].style.left = e.clientX + "px";
		})

		link[i].addEventListener('mouseleave', (e) => {
			linkHoverReveal[i].style.opacity = 0;
			linkHoverReveal[i].style.transform = `translate(-50%, -50%) rotate(-5deg)`;
			linkImages[i].style.transform = 'scale(0.8, 0.8)';
		})
	}


	//*On Scroll Title Animation Function Start *//
	const wow = new WOW({
		boxClass: "wow",
		animateClass: "animated",
		offset: 0,
		mobile: true,
		live: true
	});

	new WOW().init();

	(function ($, undefined) {
		"use strict";
		var defaults = {
			timedelay: 0.05,
			animationclass: "fadeIn",
			splittingchar: true
		};
		$.fn.splittingcharfn = function (options) {
			var settings = $.extend(defaults, options);
			$(this).each(function () {
				// var text = $(this).text().split(' ');

				if (settings.splittingchar) {
					var text = $(this).text().split("");
				} else {
					var text = $(this).text().split(" ");
				}

				for (var i = 0, len = text.length; i < len; i++) {
					var j = i + 1;
					text[i] =
						'<span class="wow ' +
						settings.animationclass +
						" word-" +
						i +
						'"  data-wow-delay="' +
						j * settings.timedelay +
						's" >' +
						text[i] +
						"</span>";
				}
				// $(this).html(text.join(' '));
				if (settings.splittingchar) {
					$(this).html(text.join(""));
				} else {
					$(this).html(text.join(" "));
				}
			});

			// return this;
		};
	})(jQuery);

	// call Function
	$(".title_split_anim").splittingcharfn({
		timedelay: 0.04,
		animationclass: "fadeIn",
		splittingchar: true
	});

	//*On Scroll Title Animation Function End *//



})(window.jQuery);