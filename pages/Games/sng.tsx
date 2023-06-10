import styles from '../../styles/Sng.module.css';
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { ServerEvents, ClientEvents } from "../../games/sng/socketEvents";
import PlayerInfoCard from '@/components/playerInfoCard';
import { RoomStatus, PlayerStatus } from '../../games/base/terms';

import * as Msg from "../../types/messages";

// The client socket must be declared outside of the component.
let socket: Socket;

export default function Poker() {
  const [playerSeatId, setPlayerSeatId] = useState(-1);
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
    // Create socket in useEffect, so that it is only created once.
    socket = io();

    // Add event listeners before attempting to connect.
    socket.on(ServerEvents.connect, () => {
      console.log(socket.id + " connected.");
    });

    // socket.on(ServerEvents.update_sng_room, (data: number) => { // RICKTODO: datattype 要改成我們要的
    //   console.log("Current number: " + data);
    //   setNumber(data);
    // });

    // RICKTODO: register all events from server here:
    socket.on(ServerEvents.player_signup, (msg: Msg.SignupBroadcast) => {
      console.log("Player " +  msg.name + " signed up at seat " + msg.id + ".");
      setName(msg.id, msg.name);
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
            id={0}
            playerSeatId={playerSeatId}
            currentRoomStatus={currentRoomStatus}
            name={names[0]}
            currentChip={currentChips[0]}
            currentBetSize={currentBetSizes[0]}
            currentPlayerStatus={currentPlayerStatuses[0]}
          />
          <PlayerInfoCard
            socket={socket}
            id={1}
            playerSeatId={playerSeatId}
            currentRoomStatus={currentRoomStatus}
            name={names[1]}
            currentChip={currentChips[1]}
            currentBetSize={currentBetSizes[1]}
            currentPlayerStatus={currentPlayerStatuses[1]}
          />
          <PlayerInfoCard
            socket={socket}
            id={2}
            playerSeatId={playerSeatId}
            currentRoomStatus={currentRoomStatus}
            name={names[2]}
            currentChip={currentChips[2]}
            currentBetSize={currentBetSizes[2]}
            currentPlayerStatus={currentPlayerStatuses[2]}
          />
          <PlayerInfoCard
            socket={socket}
            id={3}
            playerSeatId={playerSeatId}
            currentRoomStatus={currentRoomStatus}
            name={names[3]}
            currentChip={currentChips[3]}
            currentBetSize={currentBetSizes[3]}
            currentPlayerStatus={currentPlayerStatuses[3]}
          />
        </div>
        <div className={styles.second_row}>
          <PlayerInfoCard
            socket={socket}
            id={8}
            playerSeatId={playerSeatId}
            currentRoomStatus={currentRoomStatus}
            name={names[8]}
            currentChip={currentChips[8]}
            currentBetSize={currentBetSizes[8]}
            currentPlayerStatus={currentPlayerStatuses[8]}
          />
          <button>1</button>
          <PlayerInfoCard
            socket={socket}
            id={4}
            playerSeatId={playerSeatId}
            currentRoomStatus={currentRoomStatus}
            name={names[4]}
            currentChip={currentChips[4]}
            currentBetSize={currentBetSizes[4]}
            currentPlayerStatus={currentPlayerStatuses[4]}
          />
        </div>
        <div className={styles.third_row}>
          <PlayerInfoCard
            socket={socket}
            id={7}
            playerSeatId={playerSeatId}
            currentRoomStatus={currentRoomStatus}
            name={names[7]}
            currentChip={currentChips[7]}
            currentBetSize={currentBetSizes[7]}
            currentPlayerStatus={currentPlayerStatuses[7]}
          />
          <PlayerInfoCard
            socket={socket}
            id={4}
            playerSeatId={playerSeatId}
            currentRoomStatus={currentRoomStatus}
            name={names[4]}
            currentChip={currentChips[4]}
            currentBetSize={currentBetSizes[4]}
            currentPlayerStatus={currentPlayerStatuses[4]}
          />
          <PlayerInfoCard
            socket={socket}
            id={5}
            playerSeatId={playerSeatId}
            currentRoomStatus={currentRoomStatus}
            name={names[5]}
            currentChip={currentChips[5]}
            currentBetSize={currentBetSizes[5]}
            currentPlayerStatus={currentPlayerStatuses[5]}
          />
        </div>
      </div>
    </>
  )
}
