import './styles.css'
import Icon from './icon.png';

// Add title
const text: string = 'A minimum template for building a static web app with TypeScript'

const $content = document.querySelector('#content')

$content.textContent = text

// Add the image to our existing div.
const myIcon = new Image();
myIcon.src = Icon;

document.body.appendChild(myIcon);

