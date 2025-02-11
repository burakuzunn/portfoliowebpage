import { Component , AfterViewInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as THREE from 'three';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,],
  providers:[
    {provide: Window, useValue: window}
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'showtime';

  constructor(private window:Window){

  }
  ngAfterViewInit(): void {
    const width = window.innerWidth/3, height = window.innerHeight/3;

 
    
    const camera = new THREE.PerspectiveCamera( 40, width / height, 0.01, 10 );
    camera.position.z = 1;
    
    const scene = new THREE.Scene();
    
    const geometry = new THREE.BoxGeometry( 0.4, 0.9, 0.2 );
    const material = new THREE.MeshNormalMaterial();
    
    const mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    
    const renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( width, height );
    renderer.setAnimationLoop( animate );
    document.body.appendChild( renderer.domElement );
    
    // animation
    
    function animate( time :number) {
    
      mesh.rotation.x = time / 2000;
      mesh.rotation.y = time / 2000;
    
      renderer.render( scene, camera );
    
    }
  }
}
