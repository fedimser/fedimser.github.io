function initPuss() {
    // Not show the Puss on mobile devices.
    if (screen.width < 1000) return;
    
    const pussWidth = 150;
    const pussHeight = 120;
    const FPS = 20;
    
    const orbitCenterX = 75;
    const orbitCenterY = 40.5;
    const orbitA = 15.9;
    const orbitB = 5.3;
    var electronAngles = [];
    var atomTilt;
    var time = 0;
    
    const mustacheSpacePeriod = 0.1;
    const mustacheAmplitude = 4.0;
    
    var container = document.getElementById("pussContainer");
    var image = document.getElementById("pussImage");
    var canvas = document.getElementById("pussCanvas");
    var pussTimer;
    var frame;
    var ctx;
    
    var mouseX = 0;
    var mouseY = 0;
    
    // Loading graphics.
    var pussPicture = new Image();
    pussPicture.src = "img/0103.png";
    
    container.addEventListener('mouseover', startPuss);
    container.addEventListener('mouseout', stopPuss);
    container.addEventListener('mousemove', updateMousePos);
    
    //startPuss();
    
    function startPuss() {
      frame = 0;
      ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      image.style.display = "none";
      canvas.style.display = "inline";
      electronAngles = [0.76, 3.90, 0.76];
      atomTilt = 0;
      renderFrame();
      pussTimer = setInterval(renderFrame, 1000/FPS);
    }
    
    function stopPuss() {
      image.style.display = "inline";
      canvas.style.display = "none";
      ctx.clearRect(0, 0, pussWidth, pussHeight);
      clearInterval(pussTimer);
    }
    
    function updateMousePos(evt) {
      var rect = canvas.getBoundingClientRect();
      mouseX = evt.clientX - rect.left;
      mouseY = evt.clientY - rect.top;
    }
    
    function getField(x, y) {
      var dx = x - mouseX;
      var dy = y - mouseY;
      var dist = Math.sqrt(dx*dx+dy*dy);
      if (dist === 0) return 1;
      
      var q = 0.2 * dist;
      return 0.2 + 0.8 * Math.sin(q) / q;
    }
    
    
    function drawMustache(x1, y1, x2, y2, a, freq) {
      var d = x1-x2;
      var d1 = (y1-a*x1*x1) - (y2-a*x2*x2);
      var d2 = x1*(y2-a*x2*x2) - x2*(y1-a*x1*x1);

      var b = d1 / d;
      var c = d2 / d;
      
      var N = 75;
      var dx = (x2-x1) / N;
      ctx.beginPath();
      ctx.moveTo(x1,y1)
      for (var i = 1; i <= N; ++i) {
        var x = x1 + (i*dx);
        var y = a*x*x + b*x + c;
        var dy = (getField(x, y) * mustacheAmplitude) * Math.sin( (x / mustacheSpacePeriod) + freq * 6.2830 * time);
        ctx.lineTo(x, y + dy);
      }
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke(); 
    }
    
    function renderFrame() { 
        time = frame / FPS;
    
        ctx.clearRect(0, 0, pussWidth, pussHeight);
        
        atomTilt = 1.5 * time;
        ctx.fillStyle = '#000000';
        for (var i=0;i<3;i++){
          var orbitTilt = electronAngles[i] + 5.0 * time;
          var tiltAngle = (i*60+30) * Math.PI / 180 + atomTilt;
          var electronRelX = orbitA * Math.cos(orbitTilt);
          var electronRelY = orbitB * Math.sin(orbitTilt);
          var electronX = orbitCenterX - electronRelX*Math.sin(tiltAngle) + electronRelY*Math.cos(tiltAngle);
          var electronY = orbitCenterY + electronRelX*Math.cos(tiltAngle) + electronRelY*Math.sin(tiltAngle);
          
          // Draw orbit.
          ctx.beginPath();
          ctx.ellipse(orbitCenterX, orbitCenterY, orbitB, orbitA, tiltAngle, 0, 2 * Math.PI); 
          ctx.lineWidth = 0.8;
          ctx.stroke(); 
          
          // Draw electron.
          ctx.beginPath();
          ctx.arc(electronX, electronY, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Draw nucleus.
        ctx.beginPath();
        ctx.arc(orbitCenterX, orbitCenterY, 3, 0, 2 * Math.PI);
        ctx.fill();        
        
        // Draw the mustaches
        // Left.
        drawMustache(75-15, 99, 75-72, 93, 0.007, 3);
        drawMustache(75-16.5, 102, 75-73, 105, 0.007, 4);
        drawMustache(75-18, 105, 75-74, 115, 0.007, 5);
        
        // Right.
        drawMustache(75+15, 99, 75+72, 93, 0.007, -3);
        drawMustache(75+16.5, 102, 75+73, 105, 0.007, -4);
        drawMustache(75+18, 105, 75+74, 115, 0.007, -5);
        
        // Draw the Puss.
        ctx.drawImage(pussPicture, 0, 0, pussWidth, pussHeight);
        
        frame++;
    }
}
 
  
function highlightChapter(chapter = undefined) {
  if (!chapter) {
    path = window.location.pathname;
    chapter = path.substr(path.lastIndexOf('/') + 1);
  } 
  const links = document.getElementsByClassName('chapter');
  for (let i = 0; i < links.length; ++i) { 
    if (links[i].getAttribute('href') === chapter) {
      links[i].className = 'chapter-current'; 
    }
  }
}


function showCurrentYear() {
  const yearSpan = document.getElementById('curyear');
  yearSpan.innerHTML = (new Date()).getFullYear();
}


initPuss();
highlightChapter();
showCurrentYear();
