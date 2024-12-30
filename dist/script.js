import Spheres2Background from './assets/spheres2.cdn.min.js'

const bg = Spheres2Background(document.getElementById('webgl-canvas'), {
    count: 900,
    colors: [0xff0000, 0x0, 0xffffff],
    minSize: 0.2,
    maxSize: 0.4,


})
a
const button1 = document.getElementById('colors-btn')

document.body.addEventListener('click', (ev) => {
    bg.spheres.setColors([0xffffff * Math.random(), 0xffffff * Math.random(), 0xffffff * Math.random()])
    bg.spheres.light1.color.set(0xffffff * Math.random())
});

window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            section.style.opacity = 1;
            section.style.transform = 'translateY(0)';
        } else {
            section.style.opacity = 0;
            section.style.transform = 'translateY(50px)';
        }
    });
});