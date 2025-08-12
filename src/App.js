
import React, { useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Papa from 'papaparse';
import QRCode from 'qrcode.react';
import { Button, Card, CardContent, Typography } from '@mui/material';

const seatSize = 70; const cols = 6; const rows = 3;
const categoriesColors = { VIP: '#FFD700', Officers: '#87CEFA', General: '#D3D3D3' };

export default function App(){
  const [guests, setGuests] = useState([
    { id: 1, Name: 'Alice Romero', Category: 'VIP' },
    { id: 2, Name: 'Bob Martin', Category: 'Officers' }
  ]);
  const [seats,setSeats]=useState(Array.from({length:rows*cols},(_,i)=>({id:i+1,guest:null,checked:false})));
  const [selectedGuest, setSelectedGuest] = useState(null);

  const handleFile=(e)=>{
    const f=e.target.files[0];
    if(!f) return;
    Papa.parse(f,{header:true,complete:(res)=>{
      const data=res.data.filter(r=>r.Name).map((r,idx)=>({...r,id:Date.now()+idx}));
      setGuests(prev=>[...prev,...data]);
    }});
  };

  const assign=(seatIndex)=>{
    if(!selectedGuest) { alert('Select a guest from the list first'); return; }
    const newSeats=[...seats];
    newSeats[seatIndex].guest=selectedGuest;
    setSeats(newSeats);
    setGuests(prev=>prev.filter(g=>g.id!==selectedGuest.id));
    setSelectedGuest(null);
  };

  const toggleCheck=(seatIndex)=>{
    const newSeats=[...seats]; newSeats[seatIndex].checked=!newSeats[seatIndex].checked; setSeats(newSeats);
  };

  return (<div style={{display:'flex',gap:20}}>
    <div style={{flex:1}}>
      <Typography variant='h4' gutterBottom>EventSpaceAI — Demo</Typography>
      <Card sx={{mb:2}}><CardContent>
        <input type="file" accept=".csv" onChange={handleFile} />
        <Typography variant='body2' color='text.secondary'>CSV must include header 'Name' and optional 'Category'</Typography>
      </CardContent></Card>

      <Stage width={cols*seatSize} height={rows*seatSize}>
        <Layer>
          {seats.map((s,i)=>{
            const x=(i%cols)*seatSize+10; const y=Math.floor(i/cols)*seatSize+10;
            const color=s.guest? categoriesColors[s.guest.Category] || '#fff' : '#fff';
            const stroke=s.checked? 'green' : '#666';
            return (<React.Fragment key={s.id}>
              <Rect x={x} y={y} width={seatSize-20} height={seatSize-20} fill={color} stroke={stroke} strokeWidth={3}
                onClick={()=> s.guest ? toggleCheck(i) : assign(i)} />
              <Text x={x+6} y={y+6} text={s.guest? s.guest.Name : 'Empty'} fontSize={12} />
            </React.Fragment>);
          })}
        </Layer>
      </Stage>
    </div>

    <div style={{width:340}}>
      <Card sx={{mb:2}}>
        <CardContent>
          <Typography variant='h6'>Guests</Typography>
          <div style={{maxHeight:300,overflow:'auto'}}>
            {guests.map(g=> (<div key={g.id} style={{padding:8,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #eee'}}>
              <div>
                <div style={{fontWeight:600}}>{g.Name}</div>
                <div style={{fontSize:12,color:'#666'}}>{g.Category||'General'}</div>
              </div>
              <div>
                <Button variant="contained" size="small" onClick={()=>setSelectedGuest(g)}>Select</Button>
                <Button variant="outlined" size="small" style={{marginLeft:8}} onClick={()=>{alert('QR for '+g.Name);}}>QR</Button>
              </div>
            </div>))}
          </div>
        </CardContent>
      </Card>

      <Card><CardContent>
        <Typography variant='h6'>Selected Guest</Typography>
        {selectedGuest ? (
          <div>
            <Typography>{selectedGuest.Name}</Typography>
            <Typography variant='caption'>{selectedGuest.Category}</Typography>
            <div style={{marginTop:12}}>
              <Typography variant='subtitle2'>Guest QR Code</Typography>
              <div style={{background:'#fff',padding:8,display:'inline-block'}}>
                <QRCode value={JSON.stringify({id:selectedGuest.id,name:selectedGuest.Name})} size={128} />
              </div>
              <div style={{marginTop:8}}>
                <Button variant='contained' onClick={()=>{navigator.clipboard.writeText(JSON.stringify({id:selectedGuest.id,name:selectedGuest.Name})); alert('Copied')}}>Copy Payload</Button>
              </div>
            </div>
          </div>
        ) : <Typography color='text.secondary'>No guest selected</Typography>}
      </CardContent></Card>
    </div>
  </div>);
}
