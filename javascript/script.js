let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () =>{
    menu.classList.toggle('bx-x');
    navbar.classList.toggle('active');
    
}
window.onscroll = () => {
    menu.classList.remove('bx-x');
    navbar.classList.remove('active');
}
const sr = ScrollReveal ({
    distance: '60px',
    duration: 2500,
    reset: true
})
sr.reveal('.home-text', { delay: 200, origin: 'top' })
sr.reveal('.home-img', { delay: 200, origin: 'top' })

sr.reveal('.edu', { delay: 200, origin: 'top' })
sr.reveal('.box-container', { delay: 200, origin: 'top' })
sr.reveal('.skills', { delay: 200, origin: 'top' })
sr.reveal('.row', { delay: 200, origin: 'top' })
sr.reveal('.codingprof', { delay: 200, origin: 'top' })
sr.reveal('.codehandles', { delay: 200, origin: 'top' })
sr.reveal('.card', { delay: 200, origin: 'top' })
sr.reveal('.projects', { delay: 200, origin: 'top' })
sr.reveal('.projects', { delay: 200, origin: 'top' })
sr.reveal('.contact', { delay: 200, origin: 'top' })
sr.reveal('.project-card', { delay: 200, origin: 'top' })

