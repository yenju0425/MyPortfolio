import styles from '../../styles/Sng.module.css';
import { useEffect, useState, useCallback, use } from 'react';
import io, { Socket } from 'socket.io-client';
import PlayerInfoCard from '@/components/playerInfoCard';
import { RoomStatus, PlayerStatus } from '../../games/base/terms';
import { Card, Deck } from '../../games/sng/modules/deck';

import * as Msg from '../../types/messages';
import { info } from 'console';

// The client socket must be declared outside of the component.
let socket: Socket;

export default function Poker() {
  const [playerId, setPlayerId] = useState(-1);
  const [currentRoomStatus, setCurrentRoomStatus] = useState(RoomStatus.NONE);

  // For more details on how to use useState with arrays, see: https://react.dev/learn/updating-arrays-in-state

  // players' name
  const [names, setNames] = useState(Array(9).fill(''));
  const updateName = useCallback((id: number, newName: string) => {
    setNames((prevNames) => {
      return prevNames.map((name, index) => {
        return index === id ? newName : name;
      });
    });
  }, []);
  const updateNames = useCallback((newNames: string[]) => {
    setNames((prevNames) => {
      return prevNames.map((name, index) => {
        return newNames[index];
      });
    });
  }, []);

  // players' current chip
  const [currentChips, setCurrentChips] = useState(Array(9).fill(0));
  const updateCurrentChip = useCallback((id: number, newCurrentChip: number) => {
    setCurrentChips((prevCurrentChips) => {
      return prevCurrentChips.map((currentChip, index) => {
        return index === id ? newCurrentChip : currentChip;
      });
    });
  }, []);
  const updateCurrentChips = useCallback((newCurrentChips: number[]) => {
    setCurrentChips((prevCurrentChips) => {
      return prevCurrentChips.map((currentChip, index) => {
        return newCurrentChips[index];
      });
    });
  }, []);

  // players' current bet size
  const [currentBetSizes, setCurrentBetSizes] = useState(Array(9).fill(0));
  const updateCurrentBetSize = useCallback((id: number, newCurrentBetSize: number) => {
    setCurrentBetSizes((prevCurrentBetSizes) => {
      return prevCurrentBetSizes.map((currentBetSize, index) => {
        return index === id ? newCurrentBetSize : currentBetSize;
      });
    });
  }, []);
  const updateCurrentBetSizes = useCallback((newCurrentBetSizes: number[]) => {
    setCurrentBetSizes((prevCurrentBetSizes) => {
      return prevCurrentBetSizes.map((currentBetSize, index) => {
        return newCurrentBetSizes[index];
      });
    });
  }, []);

  // players' current status
  const [currentPlayerStatuses, setCurrentPlayerStatuses] = useState(Array(9).fill(null));
  const updateCurrentPlayerStatus = useCallback((id: number, newCurrentPlayerStatus: PlayerStatus | null) => {
    setCurrentPlayerStatuses((prevCurrentPlayerStatuses) => {
      return prevCurrentPlayerStatuses.map((currentPlayerStatus, index) => {
        return index === id ? newCurrentPlayerStatus : currentPlayerStatus;
      });
    });
  }, []);
  const updateCurrentPlayerStatuses = useCallback((newCurrentPlayerStatuses: (PlayerStatus | null)[]) => {
    setCurrentPlayerStatuses((prevCurrentPlayerStatuses) => {
      return prevCurrentPlayerStatuses.map((currentPlayerStatus, index) => {
        return newCurrentPlayerStatuses[index];
      });
    });
  }, []);

  // players' hole cards
  const [playersHoleCards, setPlayersHoleCards] = useState(Array(9).fill(Array(2).fill(null)));
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
    updateName(id, '');
    updateCurrentChip(id, 0);
    updateCurrentBetSize(id, 0);
    updateCurrentPlayerStatus(id, null);
  };

  const loadRoomInfo = (info: Msg.LoadRoomInfoResponse) => {
    updateNames(info.names);
    updateCurrentChips(info.currentChips);
    updateCurrentBetSizes(info.currentBetSizes);
    updateCurrentPlayerStatuses(info.currentPlayerStatuses);
    setCurrentRoomStatus(info.currentRoomStatus);
    setPlayerId(info.playerId);
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

      socket.on("StandupBroadcast", (broadcast: Msg.StandupBroadcast) => {
        console.log("StandupBroadcast: " + JSON.stringify(broadcast));
        resetPlayerInfo(broadcast.id);
      });

      socket.on("LoadRoomInfoResponse", (response: Msg.LoadRoomInfoResponse) => {
        console.log("LoadRoomInfoResponse: " + JSON.stringify(response));
        loadRoomInfo(response);
      });

      socket.on("SignupResponse", (response: Msg.SignupResponse) => {
        console.log("SignupResponse: " + JSON.stringify(response));
        setPlayerId(response.id);
      });

      socket.on("SignupBroadcast", (broadcast: Msg.SignupBroadcast) => {
        console.log("SignupBroadcast: " + JSON.stringify(broadcast));
        updateName(broadcast.id, broadcast.name);
        updateCurrentPlayerStatus(broadcast.id, PlayerStatus.NONE);
      });

      socket.on("ReadyResponse", (response: Msg.ReadyResponse) => {
        console.log("SignupResponse: " + JSON.stringify(response));
      });

      socket.on("ReadyBroadcast", (broadcast: Msg.ReadyBroadcast) => {
        console.log("ReadyBroadcast: " + JSON.stringify(broadcast));
        updateCurrentPlayerStatus(broadcast.id, PlayerStatus.READY);
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
            name={names[0]}
            currentChip={currentChips[0]}
            currentBetSize={currentBetSizes[0]}
            currentPlayerStatus={currentPlayerStatuses[0]}
            holeCards={playersHoleCards[0]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
          <PlayerInfoCard
            socket={getSockets}
            id={1}
            name={names[1]}
            currentChip={currentChips[1]}
            currentBetSize={currentBetSizes[1]}
            currentPlayerStatus={currentPlayerStatuses[1]}
            holeCards={playersHoleCards[1]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
          <PlayerInfoCard
            socket={getSockets}
            id={2}
            name={names[2]}
            currentChip={currentChips[2]}
            currentBetSize={currentBetSizes[2]}
            currentPlayerStatus={currentPlayerStatuses[2]}
            holeCards={playersHoleCards[2]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
          <PlayerInfoCard
            socket={getSockets}
            id={3}
            name={names[3]}
            currentChip={currentChips[3]}
            currentBetSize={currentBetSizes[3]}
            currentPlayerStatus={currentPlayerStatuses[3]}
            holeCards={playersHoleCards[3]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
        </div>
        <div className={styles.second_row}>
          <PlayerInfoCard
            socket={getSockets}
            id={8}
            name={names[8]}
            currentChip={currentChips[8]}
            currentBetSize={currentBetSizes[8]}
            currentPlayerStatus={currentPlayerStatuses[8]}
            holeCards={playersHoleCards[8]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
          <button>DEALER</button>
          <PlayerInfoCard
            socket={getSockets}
            id={4}
            name={names[4]}
            currentChip={currentChips[4]}
            currentBetSize={currentBetSizes[4]}
            currentPlayerStatus={currentPlayerStatuses[4]}
            holeCards={playersHoleCards[4]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
        </div>
        <div className={styles.third_row}>
          <PlayerInfoCard
            socket={getSockets}
            id={7}
            name={names[7]}
            currentChip={currentChips[7]}
            currentBetSize={currentBetSizes[7]}
            currentPlayerStatus={currentPlayerStatuses[7]}
            holeCards={playersHoleCards[7]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
          <PlayerInfoCard
            socket={getSockets}
            id={6}
            name={names[6]}
            currentChip={currentChips[6]}
            currentBetSize={currentBetSizes[6]}
            currentPlayerStatus={currentPlayerStatuses[6]}
            holeCards={playersHoleCards[6]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
          <PlayerInfoCard
            socket={getSockets}
            id={5}
            name={names[5]}
            currentChip={currentChips[5]}
            currentBetSize={currentBetSizes[5]}
            currentPlayerStatus={currentPlayerStatuses[5]}
            holeCards={playersHoleCards[5]}
            currentRoomStatus={currentRoomStatus}
            playerId={playerId}
          />
        </div>
      </div>
    </>
  )
};
