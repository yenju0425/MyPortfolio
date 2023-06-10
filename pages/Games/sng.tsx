import styles from '../../styles/Sng.module.css';
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import PlayerInfoCard from '@/components/playerInfoCard';
import { RoomStatus, PlayerStatus } from '../../games/base/terms';

import * as Msg from "../../types/messages";

// The client socket must be declared outside of the component.
let socket: Socket;

export default function Poker() {
  const [playerId, setPlayerId] = useState(-1);
  const [currentRoomStatus, setCurrentRoomStatus] = useState(RoomStatus.NONE);

  // players' name
  const [names, setNames] = useState(Array(9).fill(''));
  const setName = (index: number, name: string) => {
    const newNames = [...names];
    newNames[index] = name;
    setNames(newNames);
  }

  // players' current chip
  const [currentChips, setCurrentChips] = useState(Array(9).fill(0));
  const setCurrentChip = (index: number, currentChip: number) => {
    const newCurrentChips = [...currentChips];
    newCurrentChips[index] = currentChip;
    setCurrentChips(newCurrentChips);
  }

  // players' current bet size
  const [currentBetSizes, setCurrentBetSizes] = useState(Array(9).fill(0));
  const setCurrentBetSize = (index: number, currentBetSize: number) => {
    const newCurrentBetSizes = [...currentBetSizes];
    newCurrentBetSizes[index] = currentBetSize;
    setCurrentBetSizes(newCurrentBetSizes);
  }

  // players' current status
  const [currentPlayerStatuses, setCurrentPlayerStatuses] = useState(Array(9).fill(PlayerStatus.NONE));
  const setCurrentPlayerStatus = (index: number, currentPlayerStatus: PlayerStatus) => {
    const newCurrentPlayerStatuses = [...currentPlayerStatuses];
    newCurrentPlayerStatuses[index] = currentPlayerStatus;
    setCurrentPlayerStatuses(newCurrentPlayerStatuses);
  }

  // let socket = io(); <- Not good practice to create socket in render, since every render will create a new socket
  // socket.emit(socketEvent.XXX, 0); <- This will cause infinite loop.

  useEffect(() => {
    console.log("Connecting to socket...");
    fetch("../api/sockets/sngSocket").finally(() => {
      if (socket) {
        console.log("Socket already exists.");
        return;
      }

      // Create socket in useEffect, so that it is only created once.
      socket = io();
      console.log("Socket created.");


      // Add event listeners before attempting to connect.
      socket.on("connect", () => {
        console.log(socket.id + " connected.");
      });

      // socket.on(ServerEvents.update_sng_room, (data: number) => { // RICKTODO: datattype 要改成我們要的
      //   console.log("Current number: " + data);
      //   setNumber(data);
      // });

      // RICKTODO: register all events from server here:
      socket.on("SignupBroadcast", (broadcast: Msg.SignupBroadcast) => {
        console.log("Player " +  broadcast.name + " signed up at seat " + broadcast.id + ".");
        setName(broadcast.id, broadcast.name);
      });

      socket.on("SignupResponse", (response: Msg.SignupResponse) => {
        console.log("Successfully signed up at seat " + response.id + ".");
        setPlayerId(response.id);
      });




    });
  
    return () => {
      if (socket) {
        console.log(socket.id + " disconnected.");
        // socket.emit(ClientEvents.disconnect); This event is automatically emitted by socket.io
      }
    }
  }, []);

  // const myFunction = async (event: React.FormEvent) => {
  //   event.preventDefault();
  //   const form = event.target as HTMLFormElement; // Cast event.target to HTMLFormElement
  //   const input = form.elements.namedItem('number') as HTMLInputElement;

  //   socket.emit(socketEvent.update_server_number, Number(input.value));
  // }

  return (
    <>
      <div className={styles.main}>
        <div className={styles.first_row}>
          <PlayerInfoCard
            socket={socket}
            seatId={0}
            name={names[0]}
            currentChip={currentChips[0]}
            currentBetSize={currentBetSizes[0]}
            currentPlayerStatus={currentPlayerStatuses[0]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
          <PlayerInfoCard
            socket={socket}
            seatId={1}
            name={names[1]}
            currentChip={currentChips[1]}
            currentBetSize={currentBetSizes[1]}
            currentPlayerStatus={currentPlayerStatuses[1]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
          <PlayerInfoCard
            socket={socket}
            seatId={2}
            name={names[2]}
            currentChip={currentChips[2]}
            currentBetSize={currentBetSizes[2]}
            currentPlayerStatus={currentPlayerStatuses[2]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
          <PlayerInfoCard
            socket={socket}
            seatId={3}
            name={names[3]}
            currentChip={currentChips[3]}
            currentBetSize={currentBetSizes[3]}
            currentPlayerStatus={currentPlayerStatuses[3]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
        </div>
        <div className={styles.second_row}>
          <PlayerInfoCard
            socket={socket}
            seatId={8}
            name={names[8]}
            currentChip={currentChips[8]}
            currentBetSize={currentBetSizes[8]}
            currentPlayerStatus={currentPlayerStatuses[8]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
          <button>1</button>
          <PlayerInfoCard
            socket={socket}
            seatId={4}
            name={names[4]}
            currentChip={currentChips[4]}
            currentBetSize={currentBetSizes[4]}
            currentPlayerStatus={currentPlayerStatuses[4]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
        </div>
        <div className={styles.third_row}>
          <PlayerInfoCard
            socket={socket}
            seatId={7}
            name={names[7]}
            currentChip={currentChips[7]}
            currentBetSize={currentBetSizes[7]}
            currentPlayerStatus={currentPlayerStatuses[7]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
          <PlayerInfoCard
            socket={socket}
            seatId={4}
            name={names[4]}
            currentChip={currentChips[4]}
            currentBetSize={currentBetSizes[4]}
            currentPlayerStatus={currentPlayerStatuses[4]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
          <PlayerInfoCard
            socket={socket}
            seatId={5}
            name={names[5]}
            currentChip={currentChips[5]}
            currentBetSize={currentBetSizes[5]}
            currentPlayerStatus={currentPlayerStatuses[5]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
        </div>
      </div>
    </>
  )
}
