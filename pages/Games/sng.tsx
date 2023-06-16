import styles from '../../styles/Sng.module.css';
import { useEffect, useState, useCallback, use } from 'react';
import io, { Socket } from 'socket.io-client';
import PlayerInfoCard from '@/components/playerInfoCard';
import { RoomStatus, PlayerStatus } from '../../games/base/terms';
import { Card, Deck } from '../../games/sng/modules/deck';

import * as Msg from '../../types/messages'; // RICKTODO: upgrade to protobuf

// The client socket must be declared outside of the component.
let socket: Socket;

export default function Poker() {
  // Immutable (Room info)
  const [clientSeatId, setClientSeatId] = useState(-1);
  const [roomCurrentStatus, setCurrentRoomStatus] = useState(RoomStatus.NONE);

  // Mutable (Players info), should avoid using them directly
  // For more details on how to use useState with arrays, see: https://react.dev/learn/updating-arrays-in-state
  const [playersNames, setPlayersNames] = useState(Array(9).fill(''));
  const [playersCurrentChips, setPlayersCurrentChips] = useState(Array(9).fill(0));
  const [playersCurrentBetSizes, setPlayersCurrentBetSizes] = useState(Array(9).fill(0));
  const [playersCurrentStatuses, setPlayersCurrentStatuses] = useState(Array(9).fill(null));
  const [playersHoleCards, setPlayersHoleCards] = useState(Array(9).fill(Array(2).fill(null)));

  const updatePlayerName = useCallback((id: number, newName: string) => {
    setPlayersNames((prevNames) => {
      return prevNames.map((name, index) => {
        return index === id ? newName : name;
      });
    });
  }, []);
  const updatePlayersNames = useCallback((newNames: string[]) => {
    setPlayersNames((prevNames) => {
      return prevNames.map((name, index) => {
        return newNames[index];
      });
    });
  }, []);

  const updatePlayerCurrentChips = useCallback((id: number, newCurrentChip: number) => {
    setPlayersCurrentChips((prevCurrentChips) => {
      return prevCurrentChips.map((currentChip, index) => {
        return index === id ? newCurrentChip : currentChip;
      });
    });
  }, []);
  const updatePlayersCurrentChips = useCallback((newCurrentChips: number[]) => {
    setPlayersCurrentChips((prevCurrentChips) => {
      return prevCurrentChips.map((currentChip, index) => {
        return newCurrentChips[index];
      });
    });
  }, []);

  const updatePlayerCurrentBetSize = useCallback((id: number, newCurrentBetSize: number) => {
    setPlayersCurrentBetSizes((prevCurrentBetSizes) => {
      return prevCurrentBetSizes.map((currentBetSize, index) => {
        return index === id ? newCurrentBetSize : currentBetSize;
      });
    });
  }, []);
  const updatePlayersCurrentBetSizes = useCallback((newCurrentBetSizes: number[]) => {
    setPlayersCurrentBetSizes((prevCurrentBetSizes) => {
      return prevCurrentBetSizes.map((currentBetSize, index) => {
        return newCurrentBetSizes[index];
      });
    });
  }, []);

  const updatePlayerCurrentStatus = useCallback((id: number, newCurrentPlayerStatus: PlayerStatus | null) => {
    setPlayersCurrentStatuses((prevCurrentPlayerStatuses) => {
      return prevCurrentPlayerStatuses.map((currentPlayerStatus, index) => {
        return index === id ? newCurrentPlayerStatus : currentPlayerStatus;
      });
    });
  }, []);
  const updatePlayersCurrentStatuses = useCallback((newCurrentPlayerStatuses: (PlayerStatus | null)[]) => {
    setPlayersCurrentStatuses((prevCurrentPlayerStatuses) => {
      return prevCurrentPlayerStatuses.map((currentPlayerStatus, index) => {
        return newCurrentPlayerStatuses[index];
      });
    });
  }, []);

  const updatePlayerHoleCards = useCallback((id: number, newPlayerHoleCards: Card[]) => {
    setPlayersHoleCards((prevPlayersHoleCards) => {
      return prevPlayersHoleCards.map((playersHoleCard, index) => {
        return index === id ? newPlayerHoleCards : playersHoleCard;
      });
    });
  }, []);
  const updatePlayersHoleCards = useCallback((newPlayersHoleCards: Card[][]) => {
    setPlayersHoleCards((prevPlayersHoleCards) => {
      return prevPlayersHoleCards.map((playersHoleCard, index) => {
        return newPlayersHoleCards[index];
      });
    });
  }, []);

  const resetPlayerInfo = (id: number) => {
    updatePlayerName(id, '');
    updatePlayerCurrentChips(id, 0);
    updatePlayerCurrentBetSize(id, 0);
    updatePlayerCurrentStatus(id, null);
  };

  const loadRoomInfo = (info: Msg.LoadRoomInfoResponse) => {
    updatePlayersNames(info.playersNames);
    updatePlayersCurrentChips(info.playersCurrentChips);
    updatePlayersCurrentBetSizes(info.playersCurrentBetSizes);
    updatePlayersCurrentStatuses(info.playersCurrentStatuses);
    setCurrentRoomStatus(info.roomCurrentStatus);
    setClientSeatId(info.clientSeatId);
  };

  // utility functions
  const getSockets = (): Socket => { // The socket is created in useEffect, which is called after the first render.
    return socket;
  };

  // let socket = io(); <- Not good practice to create socket in render, since every render will create a new socket
  // socket.emit(socketEvent.XXX, 0); <- This will cause infinite loop.

  useEffect(() => {
    fetch("../api/sockets/sngSocket").finally(() => {
      if (socket) {
        console.log("Socket exists. Socket id: " + socket.id);
      } else {
        socket = io();
        console.log("Socket created. Socket id: " + socket.id);
      }

      // Add event listeners before attempting to connect, no matter whether the socket is new or not.
      socket.on("connect", () => { // default connect event
        console.log("Connected to server.");
      });

      socket.on("ServerMessage", (message: Msg.ServerMessage) => {
        // RICKTODO
      });

      socket.on("StandupBroadcast", (broadcast: Msg.StandupBroadcast) => { // player leave the seat
        console.log("StandupBroadcast: " + JSON.stringify(broadcast));
        resetPlayerInfo(broadcast.id);
      });

      socket.on("LoadRoomInfoResponse", (response: Msg.LoadRoomInfoResponse) => { // player join the room
        console.log("LoadRoomInfoResponse: " + JSON.stringify(response));
        loadRoomInfo(response);
      });

      socket.on("SignupResponse", (response: Msg.SignupResponse) => {
        console.log("SignupResponse: " + JSON.stringify(response));
        setClientSeatId(response.id);
      });

      socket.on("SignupBroadcast", (broadcast: Msg.SignupBroadcast) => {
        console.log("SignupBroadcast: " + JSON.stringify(broadcast));
        updatePlayerName(broadcast.id, broadcast.name);
        updatePlayerCurrentStatus(broadcast.id, PlayerStatus.NONE);
      });

      socket.on("ReadyResponse", (response: Msg.ReadyResponse) => {
        console.log("ReadyResponse: " + JSON.stringify(response));
      });

      socket.on("ReadyBroadcast", (broadcast: Msg.ReadyBroadcast) => {
        console.log("ReadyBroadcast: " + JSON.stringify(broadcast));
        updatePlayerCurrentStatus(broadcast.id, PlayerStatus.READY);
      });

      socket.on("PlayerCurrentChipsBroadcast", (broadcast: Msg.PlayerCurrentChipsBroadcast) => {
        console.log("PlayerCurrentChipsBroadcast: " + JSON.stringify(broadcast)); // RICKTODO: The naming should change.
        updatePlayerCurrentChips(broadcast.id, broadcast.playersCurrentChips);
      });

      socket.on("PlayerCurrentBetSizeBroadcast", (broadcast: Msg.PlayerCurrentBetSizeBroadcast) => {
        console.log("PlayerCurrentBetSizeBroadcast: " + JSON.stringify(broadcast)); // RICKTODO: The naming should change.
        updatePlayerCurrentBetSize(broadcast.id, broadcast.currentBetSize);
      });

      socket.on("PlayerHoleCardsBroadcast", (broadcast: Msg.PlayerHoleCardsBroadcast) => {
        console.log("PlayerHoleCardsBroadcast: " + JSON.stringify(broadcast));
        updatePlayerHoleCards(broadcast.id, broadcast.holeCards);
      });

      socket.on("RoomPlayBroadcast", () => {
        console.log("RoomPlayBroadcast.");
        setCurrentRoomStatus(RoomStatus.PLAYING);
      });

      socket.on("PlayerPlayBroadcast", (broadcast: Msg.PlayerPlayBroadcast) => {
        console.log("PlayerPlayBroadcast: " + JSON.stringify(broadcast));
        updatePlayerCurrentStatus(broadcast.id, PlayerStatus.PLAYING);
      });

      // load room info every time the component mounts
      socket.emit("LoadRoomInfoRequest");
    });
  
    return () => {
    };
  }, []);

  return (
    <>
      <div className={styles.main}>
        <div className={styles.first_row}>
          <PlayerInfoCard
            socket={getSockets}
            id={0}
            name={playersNames[0]}
            currentChip={playersCurrentChips[0]}
            currentBetSize={playersCurrentBetSizes[0]}
            currentPlayerStatus={playersCurrentStatuses[0]}
            holeCards={playersHoleCards[0]}
            roomCurrentStatus={roomCurrentStatus}
            clientSeatId={clientSeatId}
          />
          <PlayerInfoCard
            socket={getSockets}
            id={1}
            name={playersNames[1]}
            currentChip={playersCurrentChips[1]}
            currentBetSize={playersCurrentBetSizes[1]}
            currentPlayerStatus={playersCurrentStatuses[1]}
            holeCards={playersHoleCards[1]}
            roomCurrentStatus={roomCurrentStatus}
            clientSeatId={clientSeatId}
          />
          <PlayerInfoCard
            socket={getSockets}
            id={2}
            name={playersNames[2]}
            currentChip={playersCurrentChips[2]}
            currentBetSize={playersCurrentBetSizes[2]}
            currentPlayerStatus={playersCurrentStatuses[2]}
            holeCards={playersHoleCards[2]}
            roomCurrentStatus={roomCurrentStatus}
            clientSeatId={clientSeatId}
          />
          <PlayerInfoCard
            socket={getSockets}
            id={3}
            name={playersNames[3]}
            currentChip={playersCurrentChips[3]}
            currentBetSize={playersCurrentBetSizes[3]}
            currentPlayerStatus={playersCurrentStatuses[3]}
            holeCards={playersHoleCards[3]}
            roomCurrentStatus={roomCurrentStatus}
            clientSeatId={clientSeatId}
          />
        </div>
        <div className={styles.second_row}>
          <PlayerInfoCard
            socket={getSockets}
            id={8}
            name={playersNames[8]}
            currentChip={playersCurrentChips[8]}
            currentBetSize={playersCurrentBetSizes[8]}
            currentPlayerStatus={playersCurrentStatuses[8]}
            holeCards={playersHoleCards[8]}
            roomCurrentStatus={roomCurrentStatus}
            clientSeatId={clientSeatId}
          />
          <button>DEALER</button>
          <PlayerInfoCard
            socket={getSockets}
            id={4}
            name={playersNames[4]}
            currentChip={playersCurrentChips[4]}
            currentBetSize={playersCurrentBetSizes[4]}
            currentPlayerStatus={playersCurrentStatuses[4]}
            holeCards={playersHoleCards[4]}
            roomCurrentStatus={roomCurrentStatus}
            clientSeatId={clientSeatId}
          />
        </div>
        <div className={styles.third_row}>
          <PlayerInfoCard
            socket={getSockets}
            id={7}
            name={playersNames[7]}
            currentChip={playersCurrentChips[7]}
            currentBetSize={playersCurrentBetSizes[7]}
            currentPlayerStatus={playersCurrentStatuses[7]}
            holeCards={playersHoleCards[7]}
            roomCurrentStatus={roomCurrentStatus}
            clientSeatId={clientSeatId}
          />
          <PlayerInfoCard
            socket={getSockets}
            id={6}
            name={playersNames[6]}
            currentChip={playersCurrentChips[6]}
            currentBetSize={playersCurrentBetSizes[6]}
            currentPlayerStatus={playersCurrentStatuses[6]}
            holeCards={playersHoleCards[6]}
            roomCurrentStatus={roomCurrentStatus}
            clientSeatId={clientSeatId}
          />
          <PlayerInfoCard
            socket={getSockets}
            id={5}
            name={playersNames[5]}
            currentChip={playersCurrentChips[5]}
            currentBetSize={playersCurrentBetSizes[5]}
            currentPlayerStatus={playersCurrentStatuses[5]}
            holeCards={playersHoleCards[5]}
            roomCurrentStatus={roomCurrentStatus}
            clientSeatId={clientSeatId}
          />
        </div>
      </div>
    </>
  )
};
