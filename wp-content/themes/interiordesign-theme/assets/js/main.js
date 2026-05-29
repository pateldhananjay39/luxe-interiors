/**
 * Luxe Interiors — Main JavaScript
 * Handles: Header scroll, mobile nav, parallax, AOS, counter, carousel, FAQ, portfolio filter, contact form
 *
 * @package InteriorDesign
 */

( function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────────────────
     UTILITIES & CINEMATIC INTERACTIVE EFFECTS
  ─────────────────────────────────────────────────────────────────────────── */

  const qs  = ( sel, ctx = document ) => ctx.querySelector( sel );
  const qsa = ( sel, ctx = document ) => Array.from( ctx.querySelectorAll( sel ) );

  function debounce( fn, wait = 100 ) {
    let timer;
    return ( ...args ) => {
      clearTimeout( timer );
      timer = setTimeout( () => fn.apply( this, args ), wait );
    };
  }

  // 1. Core Dynamic Custom Cursor Tracking
  const cursor = qs( '#custom-cursor' );
  const cursorDot = qs( '.cursor-dot', cursor );
  const cursorCircle = qs( '.cursor-circle', cursor );
  const cursorText = qs( '.cursor-badge-text', cursorCircle );

  let mouse = { x: -100, y: -100 };
  let cursorDotPos = { x: -100, y: -100 };
  let cursorCirclePos = { x: -100, y: -100 };

  window.addEventListener( 'mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true } );

  function updateCursorPhysics() {
    // Smooth Lerp (Linear Interpolation) for delay trailing circle
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
    
    cursorDotPos.x = lerp(cursorDotPos.x, mouse.x, 0.45);
    cursorDotPos.y = lerp(cursorDotPos.y, mouse.y, 0.45);
    
    cursorCirclePos.x = lerp(cursorCirclePos.x, mouse.x, 0.15);
    cursorCirclePos.y = lerp(cursorCirclePos.y, mouse.y, 0.15);

    if ( cursorDot ) {
      cursorDot.style.transform = `translate(${cursorDotPos.x}px, ${cursorDotPos.y}px) translate(-50%, -50%)`;
    }
    if ( cursorCircle ) {
      cursorCircle.style.transform = `translate(${cursorCirclePos.x}px, ${cursorCirclePos.y}px) translate(-50%, -50%)`;
    }

    // 2. Dynamic Follow-Light Sphere Positioning
    const glowSphere1 = qs( '#glow-sphere-1' );
    if ( glowSphere1 ) {
      glowSphere1.style.transform = `translate(${mouse.x - 275}px, ${mouse.y - 275}px)`;
    }

    requestAnimationFrame( updateCursorPhysics );
  }
  requestAnimationFrame( updateCursorPhysics );

  // Cursor Hover Binds
  document.addEventListener( 'mouseenter', () => {
    if ( cursor ) cursor.style.opacity = '1';
  } );
  document.addEventListener( 'mouseleave', () => {
    if ( cursor ) cursor.style.opacity = '0';
  } );

  // Magnetic & Morphing Triggers
  function setupCursorListeners() {
    // Normal link hovers
    const interactiveEls = qsa( 'a, button, .header-search-pill, .hero-search-pill' );
    interactiveEls.forEach( el => {
      el.addEventListener( 'mouseenter', () => document.body.classList.add( 'cursor-hovering' ) );
      el.addEventListener( 'mouseleave', () => document.body.classList.remove( 'cursor-hovering' ) );
    } );

    // Portfolio items badge reveal
    const projectItems = qsa( '.split-project-item' );
    projectItems.forEach( el => {
      el.addEventListener( 'mouseenter', () => {
        document.body.classList.add( 'cursor-hovering-project' );
        if ( cursorText ) cursorText.textContent = 'View';
      } );
      el.addEventListener( 'mouseleave', () => {
        document.body.classList.remove( 'cursor-hovering-project' );
      } );
    } );

    // Hotspots morphing
    const hotspotTriggers = qsa( '.hotspot-trigger' );
    hotspotTriggers.forEach( el => {
      el.addEventListener( 'mouseenter', () => document.body.classList.add( 'cursor-hovering-hotspot' ) );
      el.addEventListener( 'mouseleave', () => document.body.classList.remove( 'cursor-hovering-hotspot' ) );
    } );
  }
  
  // Re-run setup when content shifts
  setTimeout( setupCursorListeners, 300 );

  /* ──────────────────────────────────────────────────────────────────────────
     1. HEADER — scroll class & shrink effect
  ─────────────────────────────────────────────────────────────────────────── */

  const header = qs( '#site-header' );

  function handleHeaderScroll() {
    if ( ! header ) return;
    if ( window.scrollY > 60 ) {
      header.classList.add( 'scrolled' );
    } else {
      header.classList.remove( 'scrolled' );
    }
  }

  window.addEventListener( 'scroll', handleHeaderScroll, { passive: true } );
  handleHeaderScroll();

  /* ──────────────────────────────────────────────────────────────────────────
     2. MOBILE NAV
  ─────────────────────────────────────────────────────────────────────────── */

  const hamburger        = qs( '#hamburger' );
  const mobileOverlay    = qs( '#mobile-nav-overlay' );
  const mobileClose      = qs( '#mobile-nav-close' );
  const mobileNavLinks   = qsa( '.mobile-nav-menu a' );

  function openMobileNav() {
    if ( ! mobileOverlay || ! hamburger ) return;
    mobileOverlay.classList.add( 'is-open' );
    mobileOverlay.removeAttribute( 'aria-hidden' );
    hamburger.classList.add( 'is-open' );
    hamburger.setAttribute( 'aria-expanded', 'true' );
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if ( ! mobileOverlay || ! hamburger ) return;
    mobileOverlay.classList.remove( 'is-open' );
    mobileOverlay.setAttribute( 'aria-hidden', 'true' );
    hamburger.classList.remove( 'is-open' );
    hamburger.setAttribute( 'aria-expanded', 'false' );
    document.body.style.overflow = '';
  }

  if ( hamburger )     hamburger.addEventListener( 'click', openMobileNav );
  if ( mobileClose )   mobileClose.addEventListener( 'click', closeMobileNav );
  mobileNavLinks.forEach( link => link.addEventListener( 'click', closeMobileNav ) );

  document.addEventListener( 'keydown', e => {
    if ( e.key === 'Escape' ) closeMobileNav();
  } );

  /* ──────────────────────────────────────────────────────────────────────────
     3. SMOOTH SCROLL for anchor links
  ─────────────────────────────────────────────────────────────────────────── */

  document.addEventListener( 'click', e => {
    const link = e.target.closest( 'a[href^="#"]' );
    if ( ! link ) return;
    const href = link.getAttribute( 'href' );
    if ( href === '#' ) return;
    const target = qs( href );
    if ( ! target ) return;
    e.preventDefault();
    const headerH = header ? header.offsetHeight : 80;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
    window.scrollTo( { top, behavior: 'smooth' } );
  } );

  /* ──────────────────────────────────────────────────────────────────────────
     4. PARALLAX HERO SCENE, OVERLAPPING CARD STACK & INTERACTIVE TILT
  ─────────────────────────────────────────────────────────────────────────── */

  const heroBg = qs( '#hero-bg' );
  const heroSection = qs( '#home' );
  const heroBgText = qs( '#hero-bg-text' );
  const heroVillaWrap = qs( '.hero-villa-wrap' );
  const heroPalms = qsa( '.hero-palm' );

  // Mouse Tracking for Hero Scene Depth Shift
  if ( heroSection ) {
    heroSection.addEventListener( 'mousemove', e => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Normalize values (-0.5 to 0.5)
      const normX = x / ( rect.width / 2 );
      const normY = y / ( rect.height / 2 );

      // Move background text slightly with mouse
      if ( heroBgText ) {
        heroBgText.style.setProperty( '--tx', `${ normX * 15 }px` );
        heroBgText.style.setProperty( '--ty', `${ normY * 10 }px` );
      }
      
      // Move foreground villa slightly opposite to mouse (increases depth perception)
      if ( heroVillaWrap ) {
        heroVillaWrap.style.setProperty( '--mx', `${ -normX * 20 }px` );
        heroVillaWrap.style.setProperty( '--my', `${ -normY * 12 }px` );
      }
    }, { passive: true } );

    // Smooth reset on mouse leave
    heroSection.addEventListener( 'mouseleave', () => {
      if ( heroBgText ) {
        heroBgText.style.setProperty( '--tx', '0px' );
        heroBgText.style.setProperty( '--ty', '0px' );
      }
      if ( heroVillaWrap ) {
        heroVillaWrap.style.setProperty( '--mx', '0px' );
        heroVillaWrap.style.setProperty( '--my', '0px' );
      }
    } );
  }

  // Scroll handler for Parallax elements and stacked cards
  const aboutSection = qs( '#about' );
  const aboutCards = qsa( '.about-stack-card' );

  function handleScrollEffects() {
    const scrollY = window.scrollY;

    // Move background at 40% of scroll speed
    if ( heroBg ) {
      heroBg.style.transform = `translateY(${ scrollY * 0.4 }px)`;
    }

    // Scroll parallax on background text
    if ( heroBgText ) {
      const tx = heroBgText.style.getPropertyValue( '--tx' ) || '0px';
      const ty = heroBgText.style.getPropertyValue( '--ty' ) || '0px';
      heroBgText.style.transform = `translate(calc(-50% + ${tx}), calc(-50% + ${ty} + ${ scrollY * 0.18 }px)) scale(${ 1 + scrollY * 0.0002 })`;
    }

    // Scroll parallax on foreground villa
    if ( heroVillaWrap ) {
      const mx = heroVillaWrap.style.getPropertyValue( '--mx' ) || '0px';
      const my = heroVillaWrap.style.getPropertyValue( '--my' ) || '0px';
      heroVillaWrap.style.transform = `translate(calc(-50% + ${mx}), calc(${my} + ${ scrollY * -0.08 }px))`;
    }

    // Scroll parallax on framing palms
    heroPalms.forEach( palm => {
      const speed = parseFloat( palm.getAttribute( 'data-parallax-speed' ) ) || 0.15;
      const isRight = palm.classList.contains( 'hero-palm--right' );
      const scaleX = isRight ? 'scaleX(-1)' : 'scaleX(1)';
      palm.style.transform = `${scaleX} translateY(${ scrollY * speed }px)`;
    } );

    // Parallax on about section cards (cards slide relative to each other)
    if ( aboutSection && aboutCards.length ) {
      const rect = aboutSection.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if ( inView ) {
        const progress = ( window.innerHeight - rect.top ) / ( window.innerHeight + rect.height );
        aboutCards.forEach( card => {
          const speed = parseFloat( card.getAttribute( 'data-parallax-speed' ) ) || 0.15;
          const translateVal = ( progress - 0.5 ) * 160 * speed;
          card.style.setProperty( '--py', `${ translateVal }px` );
        } );
      }
    }
  }

  window.addEventListener( 'scroll', handleScrollEffects, { passive: true } );
  handleScrollEffects();

  // Mouse 3D Tilt Effect on Cards (.tilt-3d)
  const tiltCards = qsa( '.tilt-3d' );

  tiltCards.forEach( card => {
    card.addEventListener( 'mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate tilt angles based on cursor position relative to card center
      const tiltX = ( ( rect.height / 2 - y ) / ( rect.height / 2 ) ) * 12; // Max 12 degrees
      const tiltY = ( ( x - rect.width / 2 ) / ( rect.width / 2 ) ) * 12; // Max 12 degrees

      card.style.setProperty( '--tx', `${ tiltX }deg` );
      card.style.setProperty( '--ty', `${ tiltY }deg` );
      card.style.setProperty( '--ts', '1.025' ); // Subtle scale up
    }, { passive: true } );

    card.addEventListener( 'mouseleave', () => {
      // Smoothly reset
      card.style.setProperty( '--tx', '0deg' );
      card.style.setProperty( '--ty', '0deg' );
      card.style.setProperty( '--ts', '1' );
    } );
  });

  /* ──────────────────────────────────────────────────────────────────────────
     5. AOS — Animate on Scroll (custom, no library dependency)
  ─────────────────────────────────────────────────────────────────────────── */

  const aosElements = qsa( '[data-aos]' );

  const aosObserver = new IntersectionObserver( ( entries ) => {
    entries.forEach( entry => {
      if ( entry.isIntersecting ) {
        entry.target.classList.add( 'aos-animate' );
        aosObserver.unobserve( entry.target );
      }
    } );
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  } );

  aosElements.forEach( el => aosObserver.observe( el ) );

  /* ──────────────────────────────────────────────────────────────────────────
     6. COUNTER ANIMATION (Hero Stats)
  ─────────────────────────────────────────────────────────────────────────── */

  const counterEls = qsa( '[data-count]' );

  function animateCounter( el ) {
    const target   = parseInt( el.getAttribute( 'data-count' ), 10 );
    const duration = 1800;
    const start    = performance.now();

    function step( now ) {
      const elapsed  = now - start;
      const progress = Math.min( elapsed / duration, 1 );
      // Ease out cubic
      const eased = 1 - Math.pow( 1 - progress, 3 );
      el.textContent = Math.round( eased * target );
      if ( progress < 1 ) requestAnimationFrame( step );
    }

    requestAnimationFrame( step );
  }

  if ( counterEls.length ) {
    const counterObserver = new IntersectionObserver( ( entries ) => {
      entries.forEach( entry => {
        if ( entry.isIntersecting ) {
          animateCounter( entry.target );
          counterObserver.unobserve( entry.target );
        }
      } );
    }, { threshold: 0.5 } );

    counterEls.forEach( el => counterObserver.observe( el ) );
  }

  /* ──────────────────────────────────────────────────────────────────────────
     7. HORIZONTAL SPLIT PROJECT TILT CALCULATIONS
  ─────────────────────────────────────────────────────────────────────────── */

  const splitItems = qsa( '.split-project-item' );

  splitItems.forEach( item => {
    const imgWrap = qs( '.split-img-wrap', item );
    if ( ! imgWrap ) return;

    item.addEventListener( 'mousemove', e => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate tilt angles relative to hover height/width
      const tiltX = ( ( rect.height / 2 - y ) / ( rect.height / 2 ) ) * 15; // Max 15 deg
      const tiltY = ( ( x - rect.width / 2 ) / ( rect.width / 2 ) ) * 10;   // Max 10 deg

      imgWrap.style.setProperty( '--rx', `${ -tiltX }deg` );
      imgWrap.style.setProperty( '--ry', `${ tiltY }deg` );
    }, { passive: true } );

    item.addEventListener( 'mouseleave', () => {
      imgWrap.style.setProperty( '--rx', '0deg' );
      imgWrap.style.setProperty( '--ry', '0deg' );
    } );
  } );

  /* ──────────────────────────────────────────────────────────────────────────
     8. TESTIMONIALS CAROUSEL
  ─────────────────────────────────────────────────────────────────────────── */

  const track  = qs( '#testimonials-track' );
  const dots   = qsa( '#carousel-dots .carousel-dot' );
  const prevBtn = qs( '#testimonials-prev' );
  const nextBtn = qs( '#testimonials-next' );

  if ( track ) {
    const slides     = qsa( '.testimonial-slide', track );
    let currentSlide = 0;
    let autoTimer;

    function goToSlide( index ) {
      currentSlide = ( index + slides.length ) % slides.length;
      track.style.transform = `translateX(-${ currentSlide * 100 }%)`;

      dots.forEach( ( dot, i ) => {
        dot.classList.toggle( 'active', i === currentSlide );
        dot.setAttribute( 'aria-selected', i === currentSlide ? 'true' : 'false' );
      } );
    }

    function startAuto() {
      autoTimer = setInterval( () => goToSlide( currentSlide + 1 ), 5000 );
    }
    function stopAuto() {
      clearInterval( autoTimer );
    }

    prevBtn && prevBtn.addEventListener( 'click', () => {
      stopAuto(); goToSlide( currentSlide - 1 ); startAuto();
    } );
    nextBtn && nextBtn.addEventListener( 'click', () => {
      stopAuto(); goToSlide( currentSlide + 1 ); startAuto();
    } );

    dots.forEach( ( dot, i ) => {
      dot.addEventListener( 'click', () => {
        stopAuto(); goToSlide( i ); startAuto();
      } );
    } );

    // Keyboard navigation
    const carousel = qs( '#testimonials-carousel' );
    carousel && carousel.addEventListener( 'keydown', e => {
      if ( e.key === 'ArrowLeft' )  { stopAuto(); goToSlide( currentSlide - 1 ); startAuto(); }
      if ( e.key === 'ArrowRight' ) { stopAuto(); goToSlide( currentSlide + 1 ); startAuto(); }
    } );

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener( 'touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true } );
    track.addEventListener( 'touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if ( Math.abs( dx ) > 50 ) {
        stopAuto();
        goToSlide( dx < 0 ? currentSlide + 1 : currentSlide - 1 );
        startAuto();
      }
    } );

    startAuto();
  }

  /* ──────────────────────────────────────────────────────────────────────────
     9. FAQ ACCORDION
  ─────────────────────────────────────────────────────────────────────────── */

  const faqBtns = qsa( '.faq-question' );

  faqBtns.forEach( btn => {
    btn.addEventListener( 'click', () => {
      const answer  = qs( `#${ btn.getAttribute( 'aria-controls' ) }` );
      const isOpen  = btn.getAttribute( 'aria-expanded' ) === 'true';

      // Close all others
      faqBtns.forEach( b => {
        if ( b !== btn ) {
          b.setAttribute( 'aria-expanded', 'false' );
          const a = qs( `#${ b.getAttribute( 'aria-controls' ) }` );
          if ( a ) a.hidden = true;
        }
      } );

      // Toggle this one
      btn.setAttribute( 'aria-expanded', String( ! isOpen ) );
      if ( answer ) answer.hidden = isOpen;
    } );
  } );

  // Open first FAQ by default
  if ( faqBtns.length ) {
    const firstBtn    = faqBtns[0];
    const firstAnswer = qs( `#${ firstBtn.getAttribute( 'aria-controls' ) }` );
    firstBtn.setAttribute( 'aria-expanded', 'true' );
    if ( firstAnswer ) firstAnswer.hidden = false;
  }

  /* ──────────────────────────────────────────────────────────────────────────
     10. CONTACT FORM — AJAX Submission
  ─────────────────────────────────────────────────────────────────────────── */

  const contactForm   = qs( '#contact-form' );
  const submitBtn     = qs( '#contact-submit' );
  const formFeedback  = qs( '#form-feedback' );

  if ( contactForm ) {
    contactForm.addEventListener( 'submit', async e => {
      e.preventDefault();

      if ( ! contactForm.checkValidity() ) {
        contactForm.reportValidity();
        return;
      }

      // Show loading state
      if ( submitBtn ) {
        submitBtn.disabled = true;
        qs( '.btn-text',    submitBtn ).hidden = true;
        qs( '.btn-loading', submitBtn ).hidden = false;
      }
      if ( formFeedback ) { formFeedback.hidden = true; formFeedback.className = 'form-feedback'; }

      try {
        const data = new FormData( contactForm );
        data.set( 'action', 'idl_contact' );
        data.set( 'nonce',  ( typeof idlData !== 'undefined' ? idlData.nonce : '' ) );

        const res  = await fetch( typeof idlData !== 'undefined' ? idlData.ajaxUrl : '/wp-admin/admin-ajax.php', {
          method: 'POST',
          body:   data,
        } );
        const json = await res.json();

        if ( formFeedback ) {
          formFeedback.hidden    = false;
          formFeedback.className = 'form-feedback ' + ( json.success ? 'success' : 'error' );
          formFeedback.textContent = json.data?.message || ( json.success ? 'Message sent!' : 'An error occurred.' );
        }

        if ( json.success ) contactForm.reset();

      } catch {
        if ( formFeedback ) {
          formFeedback.hidden    = false;
          formFeedback.className = 'form-feedback error';
          formFeedback.textContent = 'Network error. Please try again.';
        }
      } finally {
        if ( submitBtn ) {
          submitBtn.disabled = false;
          qs( '.btn-text',    submitBtn ).hidden = false;
          qs( '.btn-loading', submitBtn ).hidden = true;
        }
      }
    } );
  }

  /* ──────────────────────────────────────────────────────────────────────────
     11. SCROLL TO TOP BUTTON
  ─────────────────────────────────────────────────────────────────────────── */

  const scrollTopBtn = qs( '#scroll-top' );

  if ( scrollTopBtn ) {
    window.addEventListener( 'scroll', debounce( () => {
      scrollTopBtn.classList.toggle( 'visible', window.scrollY > 500 );
    }, 50 ), { passive: true } );

    scrollTopBtn.addEventListener( 'click', () => {
      window.scrollTo( { top: 0, behavior: 'smooth' } );
    } );
  }

  /* ──────────────────────────────────────────────────────────────────────────
     12. ACTIVE NAV LINK HIGHLIGHT on scroll (Intersection Observer)
  ─────────────────────────────────────────────────────────────────────────── */

  const sections  = qsa( 'section[id]' );
  const navLinks  = qsa( '.nav-menu a[href^="#"]' );

  if ( sections.length && navLinks.length ) {
    const sectionObserver = new IntersectionObserver( entries => {
      entries.forEach( entry => {
        if ( entry.isIntersecting ) {
          const id = entry.target.id;
          navLinks.forEach( link => {
            const isMatch = link.getAttribute( 'href' ) === `#${ id }`;
            link.parentElement.classList.toggle( 'current-menu-item', isMatch );
          } );
        }
      } );
    }, { rootMargin: `-${ ( header?.offsetHeight || 80 ) + 20 }px 0px -50% 0px` } );

    sections.forEach( s => sectionObserver.observe( s ) );
  }

  /* ──────────────────────────────────────────────────────────────────────────
     13. INTERACTIVE HOTSPOTS TOOLTIPS
  ─────────────────────────────────────────────────────────────────────────── */

  const hotspotPoints = qsa( '.hotspot-point' );

  hotspotPoints.forEach( point => {
    const trigger = qs( '.hotspot-trigger', point );
    
    if ( trigger ) {
      // Toggle on click
      trigger.addEventListener( 'click', e => {
        e.stopPropagation();
        const isOpen = point.classList.contains( 'is-active' );
        
        // Close all other hotspots
        hotspotPoints.forEach( p => {
          p.classList.remove( 'is-active' );
          const t = qs( '.hotspot-trigger', p );
          if ( t ) t.setAttribute( 'aria-expanded', 'false' );
        } );

        if ( ! isOpen ) {
          point.classList.add( 'is-active' );
          trigger.setAttribute( 'aria-expanded', 'true' );
        }
      } );
    }
  } );

  // Close hotspots if clicking outside
  document.addEventListener( 'click', () => {
    hotspotPoints.forEach( p => {
      p.classList.remove( 'is-active' );
      const t = qs( '.hotspot-trigger', p );
      if ( t ) t.setAttribute( 'aria-expanded', 'false' );
    } );
  } );

  /* ──────────────────────────────────────────────────────────────────────────
     14. LAZY-LOAD HERO BG IMAGE
  ─────────────────────────────────────────────────────────────────────────── */
  // The hero-bg div uses a CSS background-image pointing to assets/images/hero-bg.jpg
  // It will load as part of the CSS. No additional JS needed.

} )();
