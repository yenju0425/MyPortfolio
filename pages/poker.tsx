import pokerSyles from '../styles/Poker.module.css'
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { socketEvent } from "../server/events";

// The client socket must be declared outside of the component.
let socket: Socket;

export default function Poker() {
  const [num, setNumber] = useState<number>(0);
  
  // let socket = io(); // Not good practice to create socket in render, since every render will create a new socket
  // socket.emit(socketEvent.update_server_number, 0); // This will cause infinite loop.

  useEffect(() => {
    // Create socket in useEffect, so that it is only created once.
    socket = io();

    // Add event listeners before attempting to connect.
    socket.on(socketEvent.connect, () => {
      console.log(socketEvent.connect);
      socket.emit(socketEvent.update_server_number, 0);
    });
    
    socket.on(socketEvent.update_client_number, (new_number: number) => {
      console.log(`${ socketEvent.update_client_number }: ${ new_number }`);
      setNumber(new_number);
    });

    fetch("./api/socket/socket").finally(() => {
      console.log("Socket connected.");
    });
  
    return () => {
      if (socket) {
        console.log("Socket disconnected.");
        // socket.disconnect();
      }
    }
  }, []);

  const myFunction = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement; // Cast event.target to HTMLFormElement
    const input = form.elements.namedItem('number') as HTMLInputElement;

    socket.emit(socketEvent.update_server_number, Number(input.value));
  }

  return (
    <>
      <div className={ pokerSyles.table }>
        <p>Current number: <span id="current-number"> { num } </span></p>
      </div>

      <form onSubmit={ myFunction }>
        <input type="number" id="number-input" name="number"></input>
        <button type="submit">Add</button>
      </form>
    </>
  )
}
