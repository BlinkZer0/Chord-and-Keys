// ========================= SVG INSTRUMENT MODELS =========================

// Fingering data for SVG instruments
export const SVG_FINGERINGS = {
  flute: {
    C:[1,1,1,1,1,1],
    'C#':[0,1,1,1,1,1],
    D:[0,1,1,1,1,1],
    'D#':[1,0,0,1,1,1],
    E:[0,0,1,1,1,1],
    F:[0,0,0,1,1,1],
    'F#':[0,0,0,0,1,1],
    G:[0,0,0,0,0,1],
    'G#':[0,0,0,0,0,0],
    A:[0,1,0,0,0,0],
    'A#':[1,0,0,0,0,0],
    B:[0,1,1,0,0,0]
  },
  recorder: {
    C:[1,1,1,1,1,1,1,1],
    'C#':[1,1,1,1,1,1,1,0],
    D:[1,1,1,1,1,1,0,0],
    'D#':[1,1,1,1,1,0,0,1],
    E:[1,1,1,1,0,0,0,0],
    F:[1,1,1,0,0,0,0,0],
    'F#':[1,1,0,0,0,0,0,0],
    G:[1,0,0,0,0,0,0,0],
    'G#':[0,1,1,0,0,0,0,0],
    A:[0,1,0,0,0,0,0,0],
    'A#':[0,1,1,1,0,0,0,0],
    B:[0,1,1,0,0,0,0,0]
  },
  trumpet: {
    C:[0,0,0],
    'C#':[1,1,1],
    D:[1,0,1],
    'D#':[0,1,1],
    E:[1,1,0],
    F:[1,0,0],
    'F#':[0,1,0],
    G:[0,0,0],
    'G#':[1,0,1],
    A:[1,1,0],
    'A#':[1,0,0],
    B:[0,1,0]
  },
  saxophone: {
    C:[1,1,1,1,1,1],
    'C#':[0,1,1,1,1,1],
    D:[0,1,1,1,1,1],
    'D#':[1,0,0,1,1,1],
    E:[0,0,1,1,1,1],
    F:[0,0,0,1,1,1],
    'F#':[0,0,0,0,1,1],
    G:[0,0,0,0,0,1],
    'G#':[0,0,0,0,0,0],
    A:[0,1,0,0,0,0],
    'A#':[1,0,0,0,0,0],
    B:[0,1,1,0,0,0]
  },
  ney: {
    C:[1,1,1,1,1,1,1],
    'C#':[0,1,1,1,1,1,1],
    D:[0,1,1,1,1,1,0],
    'D#':[1,0,0,1,1,1,1],
    E:[0,0,1,1,1,0,0],
    F:[0,0,0,1,1,0,0],
    'F#':[0,0,0,0,1,0,0],
    G:[0,0,0,0,0,0,0],
    'G#':[1,0,0,0,0,0,0],
    A:[1,1,0,0,0,0,0],
    'A#':[1,1,1,0,0,0,0],
    B:[1,1,1,1,0,0,0]
  }
};

// Global variables for SVG instrument orientations
export let fluteLeftToRight = true;
export let fluteOrientation = 'horizontal';
export let recorderLeftToRight = true;
export let recorderOrientation = 'horizontal';
export let trumpetLeftToRight = true;
export let trumpetOrientation = 'horizontal';
export let saxophoneLeftToRight = true;
export let saxophoneOrientation = 'horizontal';
export let neyLeftToRight = true;
export let neyOrientation = 'horizontal';

// SVG building functions
export function buildFluteChart(computeSelected, pcName, ENHARMONIC_MAP, fluteHost) {
  const {rootPc} = computeSelected();
  const note = pcName(rootPc);
  const sharp = ENHARMONIC_MAP[note] || note;
  const fing = SVG_FINGERINGS.flute[sharp] || [0,0,0,0,0,0];
  fluteHost.innerHTML='';
  const svgNS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(svgNS,'svg');
  const isHoriz = fluteOrientation === 'horizontal';
  svg.setAttribute('viewBox', isHoriz ? '0 0 320 80' : '0 0 80 320');
  svg.setAttribute('class','mx-auto');
  
  // Realistic flute body with sections and proper proportions
  if(isHoriz){
    // Main tube body (cylindrical appearance with gradient)
    const grad = document.createElementNS(svgNS,'defs');
    const gradDef = document.createElementNS(svgNS,'linearGradient');
    gradDef.setAttribute('id','fluteGrad');
    gradDef.setAttribute('x1','0%');
    gradDef.setAttribute('y1','0%');
    gradDef.setAttribute('x2','0%');
    gradDef.setAttribute('y2','100%');
    const stop1 = document.createElementNS(svgNS,'stop');
    stop1.setAttribute('offset','0%');
    stop1.setAttribute('stop-color','#e2e8f0');
    const stop2 = document.createElementNS(svgNS,'stop');
    stop2.setAttribute('offset','50%');
    stop2.setAttribute('stop-color','#f8fafc');
    const stop3 = document.createElementNS(svgNS,'stop');
    stop3.setAttribute('offset','100%');
    stop3.setAttribute('stop-color','#cbd5e1');
    [stop1,stop2,stop3].forEach(s=>gradDef.appendChild(s));
    grad.appendChild(gradDef);
    svg.appendChild(grad);
    
    // Head joint with embouchure
    const headJoint = document.createElementNS(svgNS,'rect');
    headJoint.setAttribute('x', fluteLeftToRight ? '10' : '250');
    headJoint.setAttribute('y','25');
    headJoint.setAttribute('width','60');
    headJoint.setAttribute('height','30');
    headJoint.setAttribute('rx','15');
    headJoint.setAttribute('fill','url(#fluteGrad)');
    headJoint.setAttribute('stroke','#64748b');
    headJoint.setAttribute('stroke-width','1.5');
    svg.appendChild(headJoint);
    
    // Embouchure hole
    const embHole = document.createElementNS(svgNS,'ellipse');
    embHole.setAttribute('cx', fluteLeftToRight ? '40' : '280');
    embHole.setAttribute('cy','40');
    embHole.setAttribute('rx','8');
    embHole.setAttribute('ry','4');
    embHole.setAttribute('fill','#1e293b');
    embHole.setAttribute('stroke','#475569');
    embHole.setAttribute('stroke-width','1');
    svg.appendChild(embHole);
    
    // Body joint
    const bodyJoint = document.createElementNS(svgNS,'rect');
    bodyJoint.setAttribute('x', fluteLeftToRight ? '75' : '145');
    bodyJoint.setAttribute('y','27');
    bodyJoint.setAttribute('width','100');
    bodyJoint.setAttribute('height','26');
    bodyJoint.setAttribute('rx','13');
    bodyJoint.setAttribute('fill','url(#fluteGrad)');
    bodyJoint.setAttribute('stroke','#64748b');
    bodyJoint.setAttribute('stroke-width','1.5');
    svg.appendChild(bodyJoint);
    
    // Foot joint
    const footJoint = document.createElementNS(svgNS,'rect');
    footJoint.setAttribute('x', fluteLeftToRight ? '180' : '80');
    footJoint.setAttribute('y','28');
    footJoint.setAttribute('width','70');
    footJoint.setAttribute('height','24');
    footJoint.setAttribute('rx','12');
    footJoint.setAttribute('fill','url(#fluteGrad)');
    footJoint.setAttribute('stroke','#64748b');
    footJoint.setAttribute('stroke-width','1.5');
    svg.appendChild(footJoint);
    
    // Realistic tone hole positions and keys
    const holePositions = fluteLeftToRight ? 
      [90, 105, 125, 145, 165, 185] : 
      [230, 215, 195, 175, 155, 135];
    
    fing.forEach((closed,i)=>{
      const holeX = holePositions[i];
      
      // Key mechanism (small rectangle above hole)
      const key = document.createElementNS(svgNS,'rect');
      key.setAttribute('x', String(holeX - 8));
      key.setAttribute('y','20');
      key.setAttribute('width','16');
      key.setAttribute('height','8');
      key.setAttribute('rx','2');
      key.setAttribute('fill', closed ? '#fbbf24' : '#e2e8f0');
      key.setAttribute('stroke','#64748b');
      key.setAttribute('stroke-width','1');
      svg.appendChild(key);
      
      // Tone hole
      const hole = document.createElementNS(svgNS,'circle');
      hole.setAttribute('cx', String(holeX));
      hole.setAttribute('cy','40');
      hole.setAttribute('r','5');
      hole.setAttribute('fill', closed ? '#374151' : '#1e293b');
      hole.setAttribute('stroke','#64748b');
      hole.setAttribute('stroke-width','1');
      svg.appendChild(hole);
      
      // Key spring/mechanism rod
      const rod = document.createElementNS(svgNS,'line');
      rod.setAttribute('x1', String(holeX));
      rod.setAttribute('y1','28');
      rod.setAttribute('x2', String(holeX));
      rod.setAttribute('y2','33');
      rod.setAttribute('stroke','#94a3b8');
      rod.setAttribute('stroke-width','1');
      svg.appendChild(rod);
    });
    
  } else {
    // Vertical orientation - similar but rotated layout
    // Main gradient for vertical
    const grad = document.createElementNS(svgNS,'defs');
    const gradDef = document.createElementNS(svgNS,'linearGradient');
    gradDef.setAttribute('id','fluteGradV');
    gradDef.setAttribute('x1','0%');
    gradDef.setAttribute('y1','0%');
    gradDef.setAttribute('x2','100%');
    gradDef.setAttribute('y2','0%');
    const stop1 = document.createElementNS(svgNS,'stop');
    stop1.setAttribute('offset','0%');
    stop1.setAttribute('stop-color','#e2e8f0');
    const stop2 = document.createElementNS(svgNS,'stop');
    stop2.setAttribute('offset','50%');
    stop2.setAttribute('stop-color','#f8fafc');
    const stop3 = document.createElementNS(svgNS,'stop');
    stop3.setAttribute('offset','100%');
    stop3.setAttribute('stop-color','#cbd5e1');
    [stop1,stop2,stop3].forEach(s=>gradDef.appendChild(s));
    grad.appendChild(gradDef);
    svg.appendChild(grad);
    
    // Head joint vertical
    const headJoint = document.createElementNS(svgNS,'rect');
    headJoint.setAttribute('x','25');
    headJoint.setAttribute('y', fluteLeftToRight ? '10' : '250');
    headJoint.setAttribute('width','30');
    headJoint.setAttribute('height','60');
    headJoint.setAttribute('rx','15');
    headJoint.setAttribute('fill','url(#fluteGradV)');
    headJoint.setAttribute('stroke','#64748b');
    headJoint.setAttribute('stroke-width','1.5');
    svg.appendChild(headJoint);
    
    // Embouchure hole vertical
    const embHole = document.createElementNS(svgNS,'ellipse');
    embHole.setAttribute('cx','40');
    embHole.setAttribute('cy', fluteLeftToRight ? '40' : '280');
    embHole.setAttribute('rx','4');
    embHole.setAttribute('ry','8');
    embHole.setAttribute('fill','#1e293b');
    embHole.setAttribute('stroke','#475569');
    embHole.setAttribute('stroke-width','1');
    svg.appendChild(embHole);
    
    // Body joint vertical
    const bodyJoint = document.createElementNS(svgNS,'rect');
    bodyJoint.setAttribute('x','27');
    bodyJoint.setAttribute('y', fluteLeftToRight ? '75' : '145');
    bodyJoint.setAttribute('width','26');
    bodyJoint.setAttribute('height','100');
    bodyJoint.setAttribute('rx','13');
    bodyJoint.setAttribute('fill','url(#fluteGradV)');
    bodyJoint.setAttribute('stroke','#64748b');
    bodyJoint.setAttribute('stroke-width','1.5');
    svg.appendChild(bodyJoint);
    
    // Foot joint vertical
    const footJoint = document.createElementNS(svgNS,'rect');
    footJoint.setAttribute('x','28');
    footJoint.setAttribute('y', fluteLeftToRight ? '180' : '80');
    footJoint.setAttribute('width','24');
    footJoint.setAttribute('height','70');
    footJoint.setAttribute('rx','12');
    footJoint.setAttribute('fill','url(#fluteGradV)');
    footJoint.setAttribute('stroke','#64748b');
    footJoint.setAttribute('stroke-width','1.5');
    svg.appendChild(footJoint);
    
    // Tone holes vertical
    const holePositions = fluteLeftToRight ? 
      [90, 105, 125, 145, 165, 185] : 
      [230, 215, 195, 175, 155, 135];
    
    fing.forEach((closed,i)=>{
      const holeY = holePositions[i];
      
      // Key mechanism
      const key = document.createElementNS(svgNS,'rect');
      key.setAttribute('x','52');
      key.setAttribute('y', String(holeY - 8));
      key.setAttribute('width','8');
      key.setAttribute('height','16');
      key.setAttribute('rx','2');
      key.setAttribute('fill', closed ? '#fbbf24' : '#e2e8f0');
      key.setAttribute('stroke','#64748b');
      key.setAttribute('stroke-width','1');
      svg.appendChild(key);
      
      // Tone hole
      const hole = document.createElementNS(svgNS,'circle');
      hole.setAttribute('cx','40');
      hole.setAttribute('cy', String(holeY));
      hole.setAttribute('r','5');
      hole.setAttribute('fill', closed ? '#374151' : '#1e293b');
      hole.setAttribute('stroke','#64748b');
      hole.setAttribute('stroke-width','1');
      svg.appendChild(hole);
      
      // Key mechanism rod
      const rod = document.createElementNS(svgNS,'line');
      rod.setAttribute('x1','47');
      rod.setAttribute('y1', String(holeY));
      rod.setAttribute('x2','52');
      rod.setAttribute('y2', String(holeY));
      rod.setAttribute('stroke','#94a3b8');
      rod.setAttribute('stroke-width','1');
      svg.appendChild(rod);
    });
  }
  fluteHost.appendChild(svg);
  const flip=document.createElement('button');
  flip.id='fluteFlip';
  flip.textContent = isHoriz ? 'Flip ↔' : 'Flip ↕';
  flip.className='mt-2 text-xs px-2 py-1 border border-slate-700 rounded';
  fluteHost.appendChild(flip);
  const orient=document.createElement('button');
  orient.id='fluteOrient';
  orient.textContent = fluteOrientation === 'horizontal' ? 'Vertical' : 'Horizontal';
  orient.className='mt-2 ml-2 text-xs px-2 py-1 border border-slate-700 rounded';
  fluteHost.appendChild(orient);
  const lbl=document.createElement('div');
  lbl.className='mt-2 text-center text-xs text-slate-400';
  lbl.textContent=`Fingering for ${sharp}`;
  fluteHost.appendChild(lbl);
  document.getElementById('fluteFlip').onclick = () => {
    fluteLeftToRight = !fluteLeftToRight;
    buildFluteChart(computeSelected, pcName, ENHARMONIC_MAP, fluteHost);
  };
  document.getElementById('fluteOrient').onclick = () => {
    fluteOrientation = fluteOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    buildFluteChart(computeSelected, pcName, ENHARMONIC_MAP, fluteHost);
  };
}

export function buildRecorderChart(computeSelected, pcName, ENHARMONIC_MAP, recorderHost) {
  const {rootPc} = computeSelected();
  const note = pcName(rootPc);
  const sharp = ENHARMONIC_MAP[note] || note;
  const fing = SVG_FINGERINGS.recorder[sharp] || [0,0,0,0,0,0,0,0];
  recorderHost.innerHTML='';
  const svgNS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(svgNS,'svg');
  const isHoriz = recorderOrientation === 'horizontal';
  svg.setAttribute('viewBox', isHoriz ? '0 0 340 100' : '0 0 100 340');
  svg.setAttribute('class','mx-auto');
  
  // Realistic recorder with proper woodwind details
  if(isHoriz){
    // Wood gradient for realistic wooden appearance
    const grad = document.createElementNS(svgNS,'defs');
    const gradDef = document.createElementNS(svgNS,'linearGradient');
    gradDef.setAttribute('id','woodGrad');
    gradDef.setAttribute('x1','0%');
    gradDef.setAttribute('y1','0%');
    gradDef.setAttribute('x2','0%');
    gradDef.setAttribute('y2','100%');
    const stop1 = document.createElementNS(svgNS,'stop');
    stop1.setAttribute('offset','0%');
    stop1.setAttribute('stop-color','#d97706');
    const stop2 = document.createElementNS(svgNS,'stop');
    stop2.setAttribute('offset','25%');
    stop2.setAttribute('stop-color','#b45309');
    const stop3 = document.createElementNS(svgNS,'stop');
    stop3.setAttribute('offset','75%');
    stop3.setAttribute('stop-color','#92400e');
    const stop4 = document.createElementNS(svgNS,'stop');
    stop4.setAttribute('offset','100%');
    stop4.setAttribute('stop-color','#78350f');
    [stop1,stop2,stop3,stop4].forEach(s=>gradDef.appendChild(s));
    grad.appendChild(gradDef);
    svg.appendChild(grad);
    
    // Mouthpiece/head section with beak
    const headSection = document.createElementNS(svgNS,'rect');
    headSection.setAttribute('x', recorderLeftToRight ? '10' : '270');
    headSection.setAttribute('y','35');
    headSection.setAttribute('width','60');
    headSection.setAttribute('height','30');
    headSection.setAttribute('rx','15');
    headSection.setAttribute('fill','url(#woodGrad)');
    headSection.setAttribute('stroke','#92400e');
    headSection.setAttribute('stroke-width','2');
    svg.appendChild(headSection);
    
    // Beak (windway)
    const beak = document.createElementNS(svgNS,'polygon');
    const beakPoints = recorderLeftToRight ? 
      '10,45 25,40 25,60 10,55' : 
      '330,45 315,40 315,60 330,55';
    beak.setAttribute('points', beakPoints);
    beak.setAttribute('fill','#78350f');
    beak.setAttribute('stroke','#451a03');
    beak.setAttribute('stroke-width','1.5');
    svg.appendChild(beak);
    
    // Upper joint (joint with thumb hole)
    const upperJoint = document.createElementNS(svgNS,'rect');
    upperJoint.setAttribute('x', recorderLeftToRight ? '75' : '205');
    upperJoint.setAttribute('y','37');
    upperJoint.setAttribute('width','60');
    upperJoint.setAttribute('height','26');
    upperJoint.setAttribute('rx','13');
    upperJoint.setAttribute('fill','url(#woodGrad)');
    upperJoint.setAttribute('stroke','#92400e');
    upperJoint.setAttribute('stroke-width','2');
    svg.appendChild(upperJoint);
    
    // Lower joint
    const lowerJoint = document.createElementNS(svgNS,'rect');
    lowerJoint.setAttribute('x', recorderLeftToRight ? '140' : '140');
    lowerJoint.setAttribute('y','38');
    lowerJoint.setAttribute('width','60');
    lowerJoint.setAttribute('height','24');
    lowerJoint.setAttribute('rx','12');
    lowerJoint.setAttribute('fill','url(#woodGrad)');
    lowerJoint.setAttribute('stroke','#92400e');
    lowerJoint.setAttribute('stroke-width','2');
    svg.appendChild(lowerJoint);
    
    // Foot joint
    const footJoint = document.createElementNS(svgNS,'rect');
    footJoint.setAttribute('x', recorderLeftToRight ? '205' : '75');
    footJoint.setAttribute('y','39');
    footJoint.setAttribute('width','60');
    footJoint.setAttribute('height','22');
    footJoint.setAttribute('rx','11');
    footJoint.setAttribute('fill','url(#woodGrad)');
    footJoint.setAttribute('stroke','#92400e');
    footJoint.setAttribute('stroke-width','2');
    svg.appendChild(footJoint);
    
    // Joint rings for realism
    const rings = recorderLeftToRight ? [70, 135, 200] : [270, 205, 140];
    rings.forEach(x => {
      const ring = document.createElementNS(svgNS,'line');
      ring.setAttribute('x1', String(x));
      ring.setAttribute('y1','35');
      ring.setAttribute('x2', String(x));
      ring.setAttribute('y2','65');
      ring.setAttribute('stroke','#451a03');
      ring.setAttribute('stroke-width','2');
      svg.appendChild(ring);
    });
    
    // Tone holes with realistic spacing
    const holePositions = recorderLeftToRight ? 
      [85, 100, 115, 130, 150, 170, 190, 210] : 
      [255, 240, 225, 210, 190, 170, 150, 130];
    
    fing.forEach((closed,i)=>{
      const holeX = holePositions[i];
      
      // Tone hole
      const hole = document.createElementNS(svgNS,'circle');
      hole.setAttribute('cx', String(holeX));
      hole.setAttribute('cy','50');
      hole.setAttribute('r','6');
      hole.setAttribute('fill', closed ? '#451a03' : '#1c1917');
      hole.setAttribute('stroke','#78350f');
      hole.setAttribute('stroke-width','1.5');
      svg.appendChild(hole);
      
      // Finger coverage indication
      if(closed) {
        const finger = document.createElementNS(svgNS,'circle');
        finger.setAttribute('cx', String(holeX));
        finger.setAttribute('cy','50');
        finger.setAttribute('r','9');
        finger.setAttribute('fill','rgba(251, 191, 36, 0.7)');
        finger.setAttribute('stroke','#f59e0b');
        finger.setAttribute('stroke-width','2');
        svg.appendChild(finger);
      }
    });
    
    // Thumb hole (back side, shown as small indicator)
    const thumbHole = document.createElementNS(svgNS,'ellipse');
    thumbHole.setAttribute('cx', recorderLeftToRight ? '95' : '245');
    thumbHole.setAttribute('cy','32');
    thumbHole.setAttribute('rx','3');
    thumbHole.setAttribute('ry','2');
    thumbHole.setAttribute('fill','#1c1917');
    thumbHole.setAttribute('stroke','#78350f');
    thumbHole.setAttribute('stroke-width','1');
    svg.appendChild(thumbHole);
    
  } else {
    // Vertical orientation - similar detailed structure
    const grad = document.createElementNS(svgNS,'defs');
    const gradDef = document.createElementNS(svgNS,'linearGradient');
    gradDef.setAttribute('id','woodGradV');
    gradDef.setAttribute('x1','0%');
    gradDef.setAttribute('y1','0%');
    gradDef.setAttribute('x2','100%');
    gradDef.setAttribute('y2','0%');
    const stop1 = document.createElementNS(svgNS,'stop');
    stop1.setAttribute('offset','0%');
    stop1.setAttribute('stop-color','#d97706');
    const stop2 = document.createElementNS(svgNS,'stop');
    stop2.setAttribute('offset','25%');
    stop2.setAttribute('stop-color','#b45309');
    const stop3 = document.createElementNS(svgNS,'stop');
    stop3.setAttribute('offset','75%');
    stop3.setAttribute('stop-color','#92400e');
    const stop4 = document.createElementNS(svgNS,'stop');
    stop4.setAttribute('offset','100%');
    stop4.setAttribute('stop-color','#78350f');
    [stop1,stop2,stop3,stop4].forEach(s=>gradDef.appendChild(s));
    grad.appendChild(gradDef);
    svg.appendChild(grad);
    
    // Head section vertical
    const headSection = document.createElementNS(svgNS,'rect');
    headSection.setAttribute('x','35');
    headSection.setAttribute('y', recorderLeftToRight ? '10' : '270');
    headSection.setAttribute('width','30');
    headSection.setAttribute('height','60');
    headSection.setAttribute('rx','15');
    headSection.setAttribute('fill','url(#woodGradV)');
    headSection.setAttribute('stroke','#92400e');
    headSection.setAttribute('stroke-width','2');
    svg.appendChild(headSection);
    
    // Beak vertical
    const beak = document.createElementNS(svgNS,'polygon');
    const beakPoints = recorderLeftToRight ? 
      '45,10 40,25 60,25 55,10' : 
      '45,330 40,315 60,315 55,330';
    beak.setAttribute('points', beakPoints);
    beak.setAttribute('fill','#78350f');
    beak.setAttribute('stroke','#451a03');
    beak.setAttribute('stroke-width','1.5');
    svg.appendChild(beak);
    
    // Joints vertical
    const upperJoint = document.createElementNS(svgNS,'rect');
    upperJoint.setAttribute('x','37');
    upperJoint.setAttribute('y', recorderLeftToRight ? '75' : '205');
    upperJoint.setAttribute('width','26');
    upperJoint.setAttribute('height','60');
    upperJoint.setAttribute('rx','13');
    upperJoint.setAttribute('fill','url(#woodGradV)');
    upperJoint.setAttribute('stroke','#92400e');
    upperJoint.setAttribute('stroke-width','2');
    svg.appendChild(upperJoint);
    
    const lowerJoint = document.createElementNS(svgNS,'rect');
    lowerJoint.setAttribute('x','38');
    lowerJoint.setAttribute('y','140');
    lowerJoint.setAttribute('width','24');
    lowerJoint.setAttribute('height','60');
    lowerJoint.setAttribute('rx','12');
    lowerJoint.setAttribute('fill','url(#woodGradV)');
    lowerJoint.setAttribute('stroke','#92400e');
    lowerJoint.setAttribute('stroke-width','2');
    svg.appendChild(lowerJoint);
    
    const footJoint = document.createElementNS(svgNS,'rect');
    footJoint.setAttribute('x','39');
    footJoint.setAttribute('y', recorderLeftToRight ? '205' : '75');
    footJoint.setAttribute('width','22');
    footJoint.setAttribute('height','60');
    footJoint.setAttribute('rx','11');
    footJoint.setAttribute('fill','url(#woodGradV)');
    footJoint.setAttribute('stroke','#92400e');
    footJoint.setAttribute('stroke-width','2');
    svg.appendChild(footJoint);
    
    // Joint rings vertical
    const rings = recorderLeftToRight ? [70, 135, 200] : [270, 205, 140];
    rings.forEach(y => {
      const ring = document.createElementNS(svgNS,'line');
      ring.setAttribute('x1','35');
      ring.setAttribute('y1', String(y));
      ring.setAttribute('x2','65');
      ring.setAttribute('y2', String(y));
      ring.setAttribute('stroke','#451a03');
      ring.setAttribute('stroke-width','2');
      svg.appendChild(ring);
    });
    
    // Tone holes vertical
    const holePositions = recorderLeftToRight ? 
      [85, 100, 115, 130, 150, 170, 190, 210] : 
      [255, 240, 225, 210, 190, 170, 150, 130];
    
    fing.forEach((closed,i)=>{
      const holeY = holePositions[i];
      
      const hole = document.createElementNS(svgNS,'circle');
      hole.setAttribute('cx','50');
      hole.setAttribute('cy', String(holeY));
      hole.setAttribute('r','6');
      hole.setAttribute('fill', closed ? '#451a03' : '#1c1917');
      hole.setAttribute('stroke','#78350f');
      hole.setAttribute('stroke-width','1.5');
      svg.appendChild(hole);
      
      if(closed) {
        const finger = document.createElementNS(svgNS,'circle');
        finger.setAttribute('cx','50');
        finger.setAttribute('cy', String(holeY));
        finger.setAttribute('r','9');
        finger.setAttribute('fill','rgba(251, 191, 36, 0.7)');
        finger.setAttribute('stroke','#f59e0b');
        finger.setAttribute('stroke-width','2');
        svg.appendChild(finger);
      }
    });
    
    // Thumb hole vertical
    const thumbHole = document.createElementNS(svgNS,'ellipse');
    thumbHole.setAttribute('cx','68');
    thumbHole.setAttribute('cy', recorderLeftToRight ? '95' : '245');
    thumbHole.setAttribute('rx','2');
    thumbHole.setAttribute('ry','3');
    thumbHole.setAttribute('fill','#1c1917');
    thumbHole.setAttribute('stroke','#78350f');
    thumbHole.setAttribute('stroke-width','1');
    svg.appendChild(thumbHole);
  }
  recorderHost.appendChild(svg);
  const flip=document.createElement('button');
  flip.id='recorderFlip';
  flip.textContent = isHoriz ? 'Flip ↔' : 'Flip ↕';
  flip.className='mt-2 text-xs px-2 py-1 border border-slate-700 rounded';
  recorderHost.appendChild(flip);
  const orient=document.createElement('button');
  orient.id='recorderOrient';
  orient.textContent = recorderOrientation === 'horizontal' ? 'Vertical' : 'Horizontal';
  orient.className='mt-2 ml-2 text-xs px-2 py-1 border border-slate-700 rounded';
  recorderHost.appendChild(orient);
  const lbl=document.createElement('div');
  lbl.className='mt-2 text-center text-xs text-slate-400';
  lbl.textContent=`Fingering for ${sharp}`;
  recorderHost.appendChild(lbl);
  document.getElementById('recorderFlip').onclick = () => {
    recorderLeftToRight = !recorderLeftToRight;
    buildRecorderChart(computeSelected, pcName, ENHARMONIC_MAP, recorderHost);
  };
  document.getElementById('recorderOrient').onclick = () => {
    recorderOrientation = recorderOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    buildRecorderChart(computeSelected, pcName, ENHARMONIC_MAP, recorderHost);
  };
}

export function buildTrumpetChart(computeSelected, pcName, ENHARMONIC_MAP, trumpetHost) {
  const {rootPc} = computeSelected();
  const note = pcName(rootPc);
  const sharp = ENHARMONIC_MAP[note] || note;
  const fing = SVG_FINGERINGS.trumpet[sharp] || [0,0,0];
  trumpetHost.innerHTML='';
  const svgNS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(svgNS,'svg');
  const isHoriz = trumpetOrientation === 'horizontal';
  svg.setAttribute('viewBox', isHoriz ? '0 0 300 120' : '0 0 120 300');
  svg.setAttribute('class','mx-auto');
  
  if(isHoriz){
    // Brass gradient
    const grad = document.createElementNS(svgNS,'defs');
    const gradDef = document.createElementNS(svgNS,'linearGradient');
    gradDef.setAttribute('id','brassGrad');
    gradDef.setAttribute('x1','0%');
    gradDef.setAttribute('y1','0%');
    gradDef.setAttribute('x2','0%');
    gradDef.setAttribute('y2','100%');
    const stop1 = document.createElementNS(svgNS,'stop');
    stop1.setAttribute('offset','0%');
    stop1.setAttribute('stop-color','#ffd700');
    const stop2 = document.createElementNS(svgNS,'stop');
    stop2.setAttribute('offset','50%');
    stop2.setAttribute('stop-color','#ffed4e');
    const stop3 = document.createElementNS(svgNS,'stop');
    stop3.setAttribute('offset','100%');
    stop3.setAttribute('stop-color','#b8860b');
    [stop1,stop2,stop3].forEach(s=>gradDef.appendChild(s));
    grad.appendChild(gradDef);
    svg.appendChild(grad);
    
    // Main bell
    const bell = document.createElementNS(svgNS,'ellipse');
    bell.setAttribute('cx', trumpetLeftToRight ? '250' : '50');
    bell.setAttribute('cy','60');
    bell.setAttribute('rx','40');
    bell.setAttribute('ry','30');
    bell.setAttribute('fill','url(#brassGrad)');
    bell.setAttribute('stroke','#b8860b');
    bell.setAttribute('stroke-width','2');
    svg.appendChild(bell);
    
    // Main tubing (curved)
    const tubing = document.createElementNS(svgNS,'path');
    const tubingPath = trumpetLeftToRight ? 
      'M210,60 Q150,40 100,60 Q50,80 50,60' : 
      'M90,60 Q150,40 200,60 Q250,80 250,60';
    tubing.setAttribute('d', tubingPath);
    tubing.setAttribute('fill','none');
    tubing.setAttribute('stroke','url(#brassGrad)');
    tubing.setAttribute('stroke-width','8');
    tubing.setAttribute('stroke-linecap','round');
    svg.appendChild(tubing);
    
    // Valve section
    const valveSection = document.createElementNS(svgNS,'rect');
    valveSection.setAttribute('x', trumpetLeftToRight ? '80' : '170');
    valveSection.setAttribute('y','45');
    valveSection.setAttribute('width','40');
    valveSection.setAttribute('height','30');
    valveSection.setAttribute('rx','15');
    valveSection.setAttribute('fill','url(#brassGrad)');
    valveSection.setAttribute('stroke','#b8860b');
    valveSection.setAttribute('stroke-width','2');
    svg.appendChild(valveSection);
    
    // Valves
    const valvePositions = trumpetLeftToRight ? [90, 100, 110] : [210, 200, 190];
    fing.forEach((pressed,i)=>{
      const valveX = valvePositions[i];
      const valve = document.createElementNS(svgNS,'circle');
      valve.setAttribute('cx', String(valveX));
      valve.setAttribute('cy','60');
      valve.setAttribute('r','6');
      valve.setAttribute('fill', pressed ? '#8b4513' : '#ffd700');
      valve.setAttribute('stroke','#b8860b');
      valve.setAttribute('stroke-width','2');
      svg.appendChild(valve);
      
      if(pressed) {
        const finger = document.createElementNS(svgNS,'circle');
        finger.setAttribute('cx', String(valveX));
        finger.setAttribute('cy','60');
        finger.setAttribute('r','10');
        finger.setAttribute('fill','rgba(251, 191, 36, 0.7)');
        finger.setAttribute('stroke','#f59e0b');
        finger.setAttribute('stroke-width','2');
        svg.appendChild(finger);
      }
    });
    
    // Mouthpiece
    const mouthpiece = document.createElementNS(svgNS,'ellipse');
    mouthpiece.setAttribute('cx', trumpetLeftToRight ? '30' : '270');
    mouthpiece.setAttribute('cy','60');
    mouthpiece.setAttribute('rx','8');
    mouthpiece.setAttribute('ry','4');
    mouthpiece.setAttribute('fill','#8b4513');
    mouthpiece.setAttribute('stroke','#654321');
    mouthpiece.setAttribute('stroke-width','1');
    svg.appendChild(mouthpiece);
    
  } else {
    // Vertical orientation - simplified
    const grad = document.createElementNS(svgNS,'defs');
    const gradDef = document.createElementNS(svgNS,'linearGradient');
    gradDef.setAttribute('id','brassGradV');
    gradDef.setAttribute('x1','0%');
    gradDef.setAttribute('y1','0%');
    gradDef.setAttribute('x2','100%');
    gradDef.setAttribute('y2','0%');
    const stop1 = document.createElementNS(svgNS,'stop');
    stop1.setAttribute('offset','0%');
    stop1.setAttribute('stop-color','#ffd700');
    const stop2 = document.createElementNS(svgNS,'stop');
    stop2.setAttribute('offset','50%');
    stop2.setAttribute('stop-color','#ffed4e');
    const stop3 = document.createElementNS(svgNS,'stop');
    stop3.setAttribute('offset','100%');
    stop3.setAttribute('stop-color','#b8860b');
    [stop1,stop2,stop3].forEach(s=>gradDef.appendChild(s));
    grad.appendChild(gradDef);
    svg.appendChild(grad);
    
    // Bell vertical
    const bell = document.createElementNS(svgNS,'ellipse');
    bell.setAttribute('cx','60');
    bell.setAttribute('cy', trumpetLeftToRight ? '250' : '50');
    bell.setAttribute('rx','30');
    bell.setAttribute('ry','40');
    bell.setAttribute('fill','url(#brassGradV)');
    bell.setAttribute('stroke','#b8860b');
    bell.setAttribute('stroke-width','2');
    svg.appendChild(bell);
    
    // Tubing vertical
    const tubing = document.createElementNS(svgNS,'path');
    const tubingPath = trumpetLeftToRight ? 
      'M60,210 Q40,150 60,100 Q80,50 60,50' : 
      'M60,90 Q40,150 60,200 Q80,250 60,250';
    tubing.setAttribute('d', tubingPath);
    tubing.setAttribute('fill','none');
    tubing.setAttribute('stroke','url(#brassGradV)');
    tubing.setAttribute('stroke-width','8');
    tubing.setAttribute('stroke-linecap','round');
    svg.appendChild(tubing);
    
    // Valve section vertical
    const valveSection = document.createElementNS(svgNS,'rect');
    valveSection.setAttribute('x','45');
    valveSection.setAttribute('y', trumpetLeftToRight ? '80' : '170');
    valveSection.setAttribute('width','30');
    valveSection.setAttribute('height','40');
    valveSection.setAttribute('rx','15');
    valveSection.setAttribute('fill','url(#brassGradV)');
    valveSection.setAttribute('stroke','#b8860b');
    valveSection.setAttribute('stroke-width','2');
    svg.appendChild(valveSection);
    
    // Valves vertical
    const valvePositions = trumpetLeftToRight ? [90, 100, 110] : [210, 200, 190];
    fing.forEach((pressed,i)=>{
      const valveY = valvePositions[i];
      const valve = document.createElementNS(svgNS,'circle');
      valve.setAttribute('cx','60');
      valve.setAttribute('cy', String(valveY));
      valve.setAttribute('r','6');
      valve.setAttribute('fill', pressed ? '#8b4513' : '#ffd700');
      valve.setAttribute('stroke','#b8860b');
      valve.setAttribute('stroke-width','2');
      svg.appendChild(valve);
      
      if(pressed) {
        const finger = document.createElementNS(svgNS,'circle');
        finger.setAttribute('cx','60');
        finger.setAttribute('cy', String(valveY));
        finger.setAttribute('r','10');
        finger.setAttribute('fill','rgba(251, 191, 36, 0.7)');
        finger.setAttribute('stroke','#f59e0b');
        finger.setAttribute('stroke-width','2');
        svg.appendChild(finger);
      }
    });
    
    // Mouthpiece vertical
    const mouthpiece = document.createElementNS(svgNS,'ellipse');
    mouthpiece.setAttribute('cx','60');
    mouthpiece.setAttribute('cy', trumpetLeftToRight ? '30' : '270');
    mouthpiece.setAttribute('rx','4');
    mouthpiece.setAttribute('ry','8');
    mouthpiece.setAttribute('fill','#8b4513');
    mouthpiece.setAttribute('stroke','#654321');
    mouthpiece.setAttribute('stroke-width','1');
    svg.appendChild(mouthpiece);
  }
  
  trumpetHost.appendChild(svg);
  const flip=document.createElement('button');
  flip.id='trumpetFlip';
  flip.textContent = isHoriz ? 'Flip ↔' : 'Flip ↕';
  flip.className='mt-2 text-xs px-2 py-1 border border-slate-700 rounded';
  trumpetHost.appendChild(flip);
  const orient=document.createElement('button');
  orient.id='trumpetOrient';
  orient.textContent = trumpetOrientation === 'horizontal' ? 'Vertical' : 'Horizontal';
  orient.className='mt-2 ml-2 text-xs px-2 py-1 border border-slate-700 rounded';
  trumpetHost.appendChild(orient);
  const lbl=document.createElement('div');
  lbl.className='mt-2 text-center text-xs text-slate-400';
  lbl.textContent=`Fingering for ${sharp}`;
  trumpetHost.appendChild(lbl);
  document.getElementById('trumpetFlip').onclick = () => {
    trumpetLeftToRight = !trumpetLeftToRight;
    buildTrumpetChart(computeSelected, pcName, ENHARMONIC_MAP, trumpetHost);
  };
  document.getElementById('trumpetOrient').onclick = () => {
    trumpetOrientation = trumpetOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    buildTrumpetChart(computeSelected, pcName, ENHARMONIC_MAP, trumpetHost);
  };
}

export function buildSaxophoneChart(computeSelected, pcName, ENHARMONIC_MAP, saxophoneHost) {
  const {rootPc} = computeSelected();
  const note = pcName(rootPc);
  const sharp = ENHARMONIC_MAP[note] || note;
  const fing = SVG_FINGERINGS.saxophone[sharp] || [0,0,0,0,0,0];
  saxophoneHost.innerHTML='';
  const svgNS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(svgNS,'svg');
  const isHoriz = saxophoneOrientation === 'horizontal';
  svg.setAttribute('viewBox', isHoriz ? '0 0 320 100' : '0 0 100 320');
  svg.setAttribute('class','mx-auto');
  
  if(isHoriz){
    // Brass gradient
    const grad = document.createElementNS(svgNS,'defs');
    const gradDef = document.createElementNS(svgNS,'linearGradient');
    gradDef.setAttribute('id','saxGrad');
    gradDef.setAttribute('x1','0%');
    gradDef.setAttribute('y1','0%');
    gradDef.setAttribute('x2','0%');
    gradDef.setAttribute('y2','100%');
    const stop1 = document.createElementNS(svgNS,'stop');
    stop1.setAttribute('offset','0%');
    stop1.setAttribute('stop-color','#ffd700');
    const stop2 = document.createElementNS(svgNS,'stop');
    stop2.setAttribute('offset','50%');
    stop2.setAttribute('stop-color','#ffed4e');
    const stop3 = document.createElementNS(svgNS,'stop');
    stop3.setAttribute('offset','100%');
    stop3.setAttribute('stop-color','#b8860b');
    [stop1,stop2,stop3].forEach(s=>gradDef.appendChild(s));
    grad.appendChild(gradDef);
    svg.appendChild(grad);
    
    // Main body (curved)
    const body = document.createElementNS(svgNS,'path');
    const bodyPath = saxophoneLeftToRight ? 
      'M20,50 Q60,30 120,50 Q180,70 240,50 Q280,40 300,50' : 
      'M300,50 Q260,30 200,50 Q140,70 80,50 Q40,40 20,50';
    body.setAttribute('d', bodyPath);
    body.setAttribute('fill','none');
    body.setAttribute('stroke','url(#saxGrad)');
    body.setAttribute('stroke-width','12');
    body.setAttribute('stroke-linecap','round');
    svg.appendChild(body);
    
    // Bell
    const bell = document.createElementNS(svgNS,'ellipse');
    bell.setAttribute('cx', saxophoneLeftToRight ? '300' : '20');
    bell.setAttribute('cy','50');
    bell.setAttribute('rx','15');
    bell.setAttribute('ry','25');
    bell.setAttribute('fill','url(#saxGrad)');
    bell.setAttribute('stroke','#b8860b');
    bell.setAttribute('stroke-width','2');
    svg.appendChild(bell);
    
    // Neck
    const neck = document.createElementNS(svgNS,'path');
    const neckPath = saxophoneLeftToRight ? 
      'M20,50 Q10,30 15,20' : 
      'M300,50 Q310,30 305,20';
    neck.setAttribute('d', neckPath);
    neck.setAttribute('fill','none');
    neck.setAttribute('stroke','url(#saxGrad)');
    neck.setAttribute('stroke-width','8');
    neck.setAttribute('stroke-linecap','round');
    svg.appendChild(neck);
    
    // Mouthpiece
    const mouthpiece = document.createElementNS(svgNS,'ellipse');
    mouthpiece.setAttribute('cx', saxophoneLeftToRight ? '15' : '305');
    mouthpiece.setAttribute('cy','20');
    mouthpiece.setAttribute('rx','6');
    mouthpiece.setAttribute('ry','3');
    mouthpiece.setAttribute('fill','#8b4513');
    mouthpiece.setAttribute('stroke','#654321');
    mouthpiece.setAttribute('stroke-width','1');
    svg.appendChild(mouthpiece);
    
    // Keys
    const keyPositions = saxophoneLeftToRight ? 
      [40, 60, 80, 100, 120, 140] : 
      [280, 260, 240, 220, 200, 180];
    
    fing.forEach((closed,i)=>{
      const keyX = keyPositions[i];
      
      // Key mechanism
      const key = document.createElementNS(svgNS,'rect');
      key.setAttribute('x', String(keyX - 8));
      key.setAttribute('y','35');
      key.setAttribute('width','16');
      key.setAttribute('height','8');
      key.setAttribute('rx','2');
      key.setAttribute('fill', closed ? '#fbbf24' : '#ffd700');
      key.setAttribute('stroke','#b8860b');
      key.setAttribute('stroke-width','1');
      svg.appendChild(key);
      
      // Tone hole
      const hole = document.createElementNS(svgNS,'circle');
      hole.setAttribute('cx', String(keyX));
      hole.setAttribute('cy','50');
      hole.setAttribute('r','4');
      hole.setAttribute('fill', closed ? '#374151' : '#1e293b');
      hole.setAttribute('stroke','#64748b');
      hole.setAttribute('stroke-width','1');
      svg.appendChild(hole);
      
      if(closed) {
        const finger = document.createElementNS(svgNS,'circle');
        finger.setAttribute('cx', String(keyX));
        finger.setAttribute('cy','50');
        finger.setAttribute('r','8');
        finger.setAttribute('fill','rgba(251, 191, 36, 0.7)');
        finger.setAttribute('stroke','#f59e0b');
        finger.setAttribute('stroke-width','2');
        svg.appendChild(finger);
      }
    });
    
  } else {
    // Vertical orientation
    const grad = document.createElementNS(svgNS,'defs');
    const gradDef = document.createElementNS(svgNS,'linearGradient');
    gradDef.setAttribute('id','saxGradV');
    gradDef.setAttribute('x1','0%');
    gradDef.setAttribute('y1','0%');
    gradDef.setAttribute('x2','100%');
    gradDef.setAttribute('y2','0%');
    const stop1 = document.createElementNS(svgNS,'stop');
    stop1.setAttribute('offset','0%');
    stop1.setAttribute('stop-color','#ffd700');
    const stop2 = document.createElementNS(svgNS,'stop');
    stop2.setAttribute('offset','50%');
    stop2.setAttribute('stop-color','#ffed4e');
    const stop3 = document.createElementNS(svgNS,'stop');
    stop3.setAttribute('offset','100%');
    stop3.setAttribute('stop-color','#b8860b');
    [stop1,stop2,stop3].forEach(s=>gradDef.appendChild(s));
    grad.appendChild(gradDef);
    svg.appendChild(grad);
    
    // Body vertical
    const body = document.createElementNS(svgNS,'path');
    const bodyPath = saxophoneLeftToRight ? 
      'M50,20 Q30,60 50,120 Q70,180 50,240 Q40,280 50,300' : 
      'M50,300 Q70,260 50,200 Q30,140 50,80 Q60,40 50,20';
    body.setAttribute('d', bodyPath);
    body.setAttribute('fill','none');
    body.setAttribute('stroke','url(#saxGradV)');
    body.setAttribute('stroke-width','12');
    body.setAttribute('stroke-linecap','round');
    svg.appendChild(body);
    
    // Bell vertical
    const bell = document.createElementNS(svgNS,'ellipse');
    bell.setAttribute('cx','50');
    bell.setAttribute('cy', saxophoneLeftToRight ? '300' : '20');
    bell.setAttribute('rx','25');
    bell.setAttribute('ry','15');
    bell.setAttribute('fill','url(#saxGradV)');
    bell.setAttribute('stroke','#b8860b');
    bell.setAttribute('stroke-width','2');
    svg.appendChild(bell);
    
    // Neck vertical
    const neck = document.createElementNS(svgNS,'path');
    const neckPath = saxophoneLeftToRight ? 
      'M50,20 Q30,10 20,15' : 
      'M50,300 Q30,310 20,305';
    neck.setAttribute('d', neckPath);
    neck.setAttribute('fill','none');
    neck.setAttribute('stroke','url(#saxGradV)');
    neck.setAttribute('stroke-width','8');
    neck.setAttribute('stroke-linecap','round');
    svg.appendChild(neck);
    
    // Mouthpiece vertical
    const mouthpiece = document.createElementNS(svgNS,'ellipse');
    mouthpiece.setAttribute('cx', saxophoneLeftToRight ? '20' : '80');
    mouthpiece.setAttribute('cy', saxophoneLeftToRight ? '15' : '305');
    mouthpiece.setAttribute('rx','3');
    mouthpiece.setAttribute('ry','6');
    mouthpiece.setAttribute('fill','#8b4513');
    mouthpiece.setAttribute('stroke','#654321');
    mouthpiece.setAttribute('stroke-width','1');
    svg.appendChild(mouthpiece);
    
    // Keys vertical
    const keyPositions = saxophoneLeftToRight ? 
      [40, 60, 80, 100, 120, 140] : 
      [280, 260, 240, 220, 200, 180];
    
    fing.forEach((closed,i)=>{
      const keyY = keyPositions[i];
      
      const key = document.createElementNS(svgNS,'rect');
      key.setAttribute('x','35');
      key.setAttribute('y', String(keyY - 8));
      key.setAttribute('width','8');
      key.setAttribute('height','16');
      key.setAttribute('rx','2');
      key.setAttribute('fill', closed ? '#fbbf24' : '#ffd700');
      key.setAttribute('stroke','#b8860b');
      key.setAttribute('stroke-width','1');
      svg.appendChild(key);
      
      const hole = document.createElementNS(svgNS,'circle');
      hole.setAttribute('cx','50');
      hole.setAttribute('cy', String(keyY));
      hole.setAttribute('r','4');
      hole.setAttribute('fill', closed ? '#374151' : '#1e293b');
      hole.setAttribute('stroke','#64748b');
      hole.setAttribute('stroke-width','1');
      svg.appendChild(hole);
      
      if(closed) {
        const finger = document.createElementNS(svgNS,'circle');
        finger.setAttribute('cx','50');
        finger.setAttribute('cy', String(keyY));
        finger.setAttribute('r','8');
        finger.setAttribute('fill','rgba(251, 191, 36, 0.7)');
        finger.setAttribute('stroke','#f59e0b');
        finger.setAttribute('stroke-width','2');
        svg.appendChild(finger);
      }
    });
  }
  
  saxophoneHost.appendChild(svg);
  const flip=document.createElement('button');
  flip.id='saxophoneFlip';
  flip.textContent = isHoriz ? 'Flip ↔' : 'Flip ↕';
  flip.className='mt-2 text-xs px-2 py-1 border border-slate-700 rounded';
  saxophoneHost.appendChild(flip);
  const orient=document.createElement('button');
  orient.id='saxophoneOrient';
  orient.textContent = saxophoneOrientation === 'horizontal' ? 'Vertical' : 'Horizontal';
  orient.className='mt-2 ml-2 text-xs px-2 py-1 border border-slate-700 rounded';
  saxophoneHost.appendChild(orient);
  const lbl=document.createElement('div');
  lbl.className='mt-2 text-center text-xs text-slate-400';
  lbl.textContent=`Fingering for ${sharp}`;
  saxophoneHost.appendChild(lbl);
  document.getElementById('saxophoneFlip').onclick = () => {
    saxophoneLeftToRight = !saxophoneLeftToRight;
    buildSaxophoneChart(computeSelected, pcName, ENHARMONIC_MAP, saxophoneHost);
  };
  document.getElementById('saxophoneOrient').onclick = () => {
    saxophoneOrientation = saxophoneOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    buildSaxophoneChart(computeSelected, pcName, ENHARMONIC_MAP, saxophoneHost);
  };
}
