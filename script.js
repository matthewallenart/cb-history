class ParallaxScroller {
    constructor() {
        this.container = document.getElementById('scrollContainer');
        this.wrapper = document.getElementById('contentWrapper');
        this.sections = document.querySelectorAll('.section');
        
        this.currentX = 0;
        this.targetX = 0;
        this.maxScroll = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startScrollX = 0;
        this.velocity = 0;
        this.lastX = 0;
        this.lastTime = 0;
        
        this.init();
    }
    
    init() {
        this.calculateMaxScroll();
        this.bindEvents();
        this.startAnimation();
        this.updateSectionVisibility();
    }
    
    calculateMaxScroll() {
        const totalWidth = Array.from(this.sections).reduce((total, section) => {
            return total + section.offsetWidth;
        }, 0);
        this.maxScroll = totalWidth - window.innerWidth;
    }
    
    bindEvents() {
        // Mouse events
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // Touch events
        this.container.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // Wheel event
        this.container.addEventListener('wheel', this.onWheel.bind(this));
        
        // Resize event
        window.addEventListener('resize', this.onResize.bind(this));
        
        // Prevent default drag behavior
        this.container.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    onMouseDown(e) {
        this.startDrag(e.clientX);
    }
    
    onTouchStart(e) {
        this.startDrag(e.touches[0].clientX);
    }
    
    startDrag(x) {
        this.isDragging = true;
        this.startX = x;
        this.startScrollX = this.currentX;
        this.velocity = 0;
        this.lastX = x;
        this.lastTime = Date.now();
        
        document.body.classList.add('dragging');
        this.wrapper.style.transition = 'none';
    }
    
    onMouseMove(e) {
        if (!this.isDragging) return;
        this.updateDrag(e.clientX);
    }
    
    onTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.updateDrag(e.touches[0].clientX);
    }
    
    updateDrag(x) {
        const deltaX = x - this.startX;
        const newX = this.startScrollX - deltaX;
        
        // Calculate velocity for momentum
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        if (deltaTime > 0) {
            this.velocity = (x - this.lastX) / deltaTime;
        }
        this.lastX = x;
        this.lastTime = currentTime;
        
        this.targetX = Math.max(0, Math.min(this.maxScroll, newX));
        this.applyParallax();
    }
    
    onMouseUp() {
        this.endDrag();
    }
    
    onTouchEnd() {
        this.endDrag();
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        document.body.classList.remove('dragging');
        this.wrapper.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Apply momentum
        const momentum = this.velocity * -300;
        this.targetX = Math.max(0, Math.min(this.maxScroll, this.targetX + momentum));
    }
    
    onWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY || e.deltaX;
        this.targetX = Math.max(0, Math.min(this.maxScroll, this.targetX + delta * 2));
        
        this.wrapper.style.transition = 'transform 0.3s ease-out';
    }
    
    onResize() {
        this.calculateMaxScroll();
        this.targetX = Math.max(0, Math.min(this.maxScroll, this.targetX));
    }
    
    startAnimation() {
        const animate = () => {
            // Smooth interpolation
            const ease = 0.08;
            this.currentX += (this.targetX - this.currentX) * ease;
            
            // Apply transform
            this.wrapper.style.transform = `translateX(${-this.currentX}px)`;
            
            // Apply parallax effects
            this.applyParallax();
            
            // Update section visibility
            this.updateSectionVisibility();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    applyParallax() {
        this.sections.forEach((section, index) => {
            const sectionRect = section.getBoundingClientRect();
            const sectionCenter = sectionRect.left + sectionRect.width / 2;
            const viewportCenter = window.innerWidth / 2;
            const distance = (sectionCenter - viewportCenter) / window.innerWidth;
            const absDistance = Math.abs(distance);
            
            // Enhanced parallax effect for background images
            const heroImage = section.querySelector('.hero-image');
            if (heroImage) {
                const parallaxX = distance * 40; // Increased from 4 for more dramatic effect
                heroImage.style.transform = `translateX(${parallaxX}px) scale(${1 + absDistance * 0.03})`;
            }
            
            // Parallax for other background images
            const bgImage = section.querySelector('.image-bg img, .new-bg img');
            if (bgImage) {
                const parallaxX = distance * 35; // Increased from 3 for more movement
                bgImage.style.transform = `translateX(${parallaxX}px) scale(${1 + absDistance * 0.025})`;
            }
            
            // Strong parallax for overlapping sections (dramatic overlay effect)
            if (section.classList.contains('text-section') || 
                section.classList.contains('white-section') || 
                section.classList.contains('final-section')) {
                
                // Much stronger movement now that overlaps prevent gaps
                const sectionParallax = distance * 80; // Increased from 5 for dramatic effect
                const scaleEffect = 1 + absDistance * 0.02; // More noticeable scaling
                section.style.transform = `translateX(${sectionParallax}px) scale(${scaleEffect})`;
                
                // Remove all box shadows
                section.style.boxShadow = 'none';
            }
            
            // Enhanced parallax for image sections too
            if (section.classList.contains('image-bg-section') || 
                section.classList.contains('new-bg-section')) {
                const sectionParallax = distance * 20; // Moderate movement for image sections
                section.style.transform = `translateX(${sectionParallax}px)`;
                
                // Remove all box shadows
                section.style.boxShadow = 'none';
            }
            
            // Reset hero section transform and ensure no shadows
            if (section.classList.contains('hero-section')) {
                section.style.transform = 'none';
                section.style.boxShadow = 'none';
            }
            
            // Enhanced parallax for text elements (exclude hero section, white section, and final section)
            if (!section.classList.contains('hero-section') && 
                !section.classList.contains('white-section') &&
                !section.classList.contains('final-section')) {
                const textElements = section.querySelectorAll('h1, h2, h3, p');
                textElements.forEach((element, elementIndex) => {
                    const parallaxY = distance * (3 + elementIndex * 0.5); // Increased movement
                    const opacity = 1 - Math.abs(distance) * 0.15; // More dramatic fade
                    
                    element.style.transform = `translateY(${parallaxY}px)`;
                    element.style.opacity = Math.max(0.7, opacity); // Allow more fade but keep readable
                });
            }
            
            // Reset transforms for white section and final section text elements to prevent unwanted movement
            if (section.classList.contains('white-section') || 
                section.classList.contains('final-section')) {
                const textElements = section.querySelectorAll('h1, h2, h3, h4, p');
                textElements.forEach((element) => {
                    element.style.transform = 'none';
                    element.style.opacity = '';
                });
            }
        });
    }
    
    updateSectionVisibility() {
        this.sections.forEach((section) => {
            const sectionRect = section.getBoundingClientRect();
            const isVisible = sectionRect.right > 0 && sectionRect.left < window.innerWidth;
            
            if (isVisible) {
                section.classList.add('in-view');
            } else {
                section.classList.remove('in-view');
            }
        });
    }
    
    // Public method to scroll to a specific section
    scrollToSection(index) {
        if (index >= 0 && index < this.sections.length) {
            let targetPosition = 0;
            for (let i = 0; i < index; i++) {
                targetPosition += this.sections[i].offsetWidth;
            }
            this.targetX = Math.max(0, Math.min(this.maxScroll, targetPosition));
            this.wrapper.style.transition = 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
    }
}

// Enhanced loading animation
function initLoadingAnimation() {
    const sections = document.querySelectorAll('.section');
    
    // Stagger the appearance of sections
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateX(100px)';
        
        setTimeout(() => {
            section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            section.style.opacity = '1';
            section.style.transform = 'translateX(0)';
        }, index * 200);
    });
}

// Keyboard navigation
function initKeyboardNavigation(scroller) {
    let currentSection = 0;
    
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                if (currentSection < scroller.sections.length - 1) {
                    currentSection++;
                    scroller.scrollToSection(currentSection);
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (currentSection > 0) {
                    currentSection--;
                    scroller.scrollToSection(currentSection);
                }
                break;
            case 'Home':
                e.preventDefault();
                currentSection = 0;
                scroller.scrollToSection(currentSection);
                break;
            case 'End':
                e.preventDefault();
                currentSection = scroller.sections.length - 1;
                scroller.scrollToSection(currentSection);
                break;
        }
    });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize loading animation
    initLoadingAnimation();
    
    // Initialize the parallax scroller after a short delay
    setTimeout(() => {
        const scroller = new ParallaxScroller();
        initKeyboardNavigation(scroller);
        
        // Add some performance optimizations
        window.addEventListener('beforeunload', () => {
            // Clean up any ongoing animations
            document.body.style.pointerEvents = 'none';
        });
        
    }, 500);
});

// Performance optimization: reduce parallax effects on slower devices
if (navigator.hardwareConcurrency <= 2) {
    document.documentElement.style.setProperty('--parallax-intensity', '0.5');
} else {
    document.documentElement.style.setProperty('--parallax-intensity', '1');
}