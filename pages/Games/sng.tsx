import styles from '../../styles/Sng.module.css';
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { ServerEvents, ClientEvents } from "../../games/sng/events";

// The client socket must be declared outside of the component.
let socket: Socket;

export default function Poker() {
  // RICKTODO: 到時候這裡應該會對應好幾組數字
  const [num, setNumber] = useState<number>(0);
  
  // let socket = io(); <- Not good practice to create socket in render, since every render will create a new socket
  // socket.emit(socketEvent.XXX, 0); <- This will cause infinite loop.

  useEffect(() => {
    // Create socket in useEffect, so that it is only created once.
    socket = io();

    // Add event listeners before attempting to connect.
    socket.on(ServerEvents.connect, () => {
      console.log(socket.id + " connected.");
    });

    socket.on(ServerEvents.update_sng_room, (data: number) => { // RICKTODO: datattype 要改成我們要的
      console.log("Current number: " + data);
      setNumber(data);
    });








    fetch("./api/socket/socket").finally(() => {
      console.log("Socket connected.");
    });
  
    return () => {
      if (socket) {
        console.log(socket.id + " disconnected.");
        // socket.emit(ClientEvents.disconnect); This event is automatically emitted by socket.io
      }
    }
  }, []);

  // RICKTODO: 把我要做的動作包裝在這裡，然後下面的畫面要呼叫這個 function
  const myFunction = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement; // Cast event.target to HTMLFormElement
    const input = form.elements.namedItem('number') as HTMLInputElement;

    // socket.emit(socketEvent.update_server_number, Number(input.value));
  }

  return (
    <>
      {/* <div className={ sngStyles.table }>
        <p>Current number: <span id="current-number"> { num } </span></p>
      </div>

      <form onSubmit={ myFunction }>
        <input type="number" id="number-input" name="number"></input>
        <button type="submit">Add</button>
      </form> */}

      <div className={ styles.main }>


      </div>


    </>
  )
}
