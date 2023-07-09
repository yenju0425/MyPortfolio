import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { RoomStatus, PlayerStatus } from '@/games/base/terms';
import { Card } from '@/games/sng/modules/deck';
import PlayerInfoCard from '@/components/playerInfoCard';
import styles from '@/styles/Sng.module.css';
import * as Msg from '@/types/messages'; // RICKTODO: upgrade to protobuf

// The client socket must be declared outside of the component.
let socket: Socket = io();

export default function Poker() {
  const [clientSeatId, setClientSeatId] = useState(-1);
  const [currentPlayerSeatId, setCurrentPlayerSeatId] = useState<number | null>(null);
  const [roomCurrentBetSize, setRoomCurrentBetSize] = useState(0);
  const [roomCurrentMinRaise, setRoomCurrentMinRaise] = useState(0);
  const [roomCurrentStatus, setRoomCurrentStatus] = useState(RoomStatus.NONE);

  // Mutable (Players info), should avoid using them directly
  // For more details on how to use useState with arrays, see: https://react.dev/learn/updating-arrays-in-state
  const [playersNames, setPlayersNames] = useState(Array(9).fill(''));
  const [playersCurrentChips, setPlayersCurrentChips] = useState(Array(9).fill(0));
  const [playersCurrentBetSizes, setPlayersCurrentBetSizes] = useState(Array(9).fill(0));
  const [playersCurrentStatuses, setPlayersCurrentStatuses] = useState(Array(9).fill(null));
  const [playersHoleCards, setPlayersHoleCards] = useState<Array<Array<Card>>>(Array(9).fill([]));
  const [communityCards, setCommunityCards] = useState<Array<Card>>(Array(0).fill([]));
  const [pots, setPots] = useState<Array<number>>(Array(0).fill(0));

  const updatePlayerName = useCallback((seatId: number, newName: string) => {
    setPlayersNames((prevNames) => {
      return prevNames.map((name, index) => {
        return index === seatId ? newName : name;
      });
    });
  }, []);
  const updatePlayersNames = useCallback((newNames: string[]) => {
    setPlayersNames([...newNames]);
  }, []);

  const updatePlayerCurrentChips = useCallback((seatId: number, newCurrentChip: number | null) => {
    setPlayersCurrentChips((prevCurrentChips) => {
      return prevCurrentChips.map((currentChip, index) => {
        return index === seatId ? newCurrentChip : currentChip;
      });
    });
  }, []);
  const updatePlayersCurrentChips = useCallback((newCurrentChips: (number | null)[]) => {
    setPlayersCurrentChips([...newCurrentChips]);
  }, []);

  const updatePlayerCurrentBetSize = useCallback((seatId: number, newCurrentBetSize: number | null) => {
    setPlayersCurrentBetSizes((prevCurrentBetSizes) => {
      return prevCurrentBetSizes.map((currentBetSize, index) => {
        return index === seatId ? newCurrentBetSize : currentBetSize;
      });
    });
  }, []);
  const updatePlayersCurrentBetSizes = useCallback((newCurrentBetSizes: (number | null)[]) => {
    setPlayersCurrentBetSizes([...newCurrentBetSizes]);
  }, []);

  const updatePlayerCurrentStatus = useCallback((seatId: number, newCurrentPlayerStatus: PlayerStatus | null) => {
    setPlayersCurrentStatuses((prevCurrentPlayerStatuses) => {
      return prevCurrentPlayerStatuses.map((currentPlayerStatus, index) => {
        return index === seatId ? newCurrentPlayerStatus : currentPlayerStatus;
      });
    });
  }, []);
  const updatePlayersCurrentStatuses = useCallback((newCurrentPlayerStatuses: (PlayerStatus | null)[]) => {
    setPlayersCurrentStatuses([...newCurrentPlayerStatuses]);
  }, []);

  const updatePlayerHoleCards = useCallback((seatId: number, newPlayerHoleCards: Card[]) => {
    setPlayersHoleCards((prevPlayersHoleCards) => {
      return prevPlayersHoleCards.map((playersHoleCard, index) => {
        return index === seatId ? newPlayerHoleCards : playersHoleCard;
      });
    });
  }, []);
  const updatePlayersHoleCards = useCallback((newPlayersHoleCards: Card[][]) => {
    setPlayersHoleCards([...newPlayersHoleCards]);
  }, []);

  const updateCommunityCards = useCallback((newCommunityCards: Card[]) => {
    setCommunityCards([...newCommunityCards]);
  }, []);

  const updatePots = useCallback((newPots: number[]) => {
    setPots([...newPots]);
  }, []);

  const resetPlayerInfo = (seatId: number) => {
    updatePlayerName(seatId, '');
    updatePlayerCurrentChips(seatId, null);
    updatePlayerCurrentBetSize(seatId, null);
    updatePlayerCurrentStatus(seatId, null);
  };

  const loadRoomInfo = (info: Msg.LoadRoomInfoResponse) => {
    setClientSeatId(info.clientSeatId);
    setCurrentPlayerSeatId(info.currentPlayerSeatId);
    setRoomCurrentBetSize(info.roomCurrentBetSize);
    setRoomCurrentMinRaise(info.roomCurrentMinRaise);
    setRoomCurrentStatus(info.roomCurrentStatus);
    updatePlayersNames(info.playersNames);
    updatePlayersCurrentChips(info.playersCurrentChips);
    updatePlayersCurrentBetSizes(info.playersCurrentBetSizes);
    updatePlayersCurrentStatuses(info.playersCurrentStatuses);
    updatePlayersHoleCards(info.playersHoleCards);
    updateCommunityCards(info.communityCards);
    updatePots(info.pots);
  };

  // utility functions
  const getSockets = (): Socket => { // The socket is created in useEffect, which is called after the first render.
    return socket;
  };

  // let socket = io(); <- Not good practice to create socket in render, since every render will create a new socket
  // socket.emit(socketEvent.XXX, 0); <- This will cause infinite loop.

  console.log("Environment: " + process.env.NODE_ENV);
  useEffect(() => {
    const url = process.env.NODE_ENV === 'development' ? "http://localhost:3000/api/sockets/sngSocket" : "https://my-portfolio-ten-liard.vercel.app/api/sockets/sngSocket";
    fetch(url).finally(() => {
      if (socket) {
        console.log("Socket exists. Socket id: " + socket.id);
      } else {
        socket = io();
        socket.on('connect', () => {
          console.log("Socket created. Socket id: " + socket.id);
        });
      }

      // Add event listeners before attempting to connect, no matter whether the socket is new or not.
      socket.on("connect", () => { // default connect event
        console.log("Connected to server.");
      });

      socket.on("ServerMessageBroadcast", (message: Msg.ServerMessageBroadcast) => {
        // RICKTODO:
      });

      socket.on("StandupBroadcast", (broadcast: Msg.StandupBroadcast) => {
        console.log("StandupBroadcast: " + JSON.stringify(broadcast));
        resetPlayerInfo(broadcast.seatId);
      });

      socket.on("SngEndBroadcast", () => {
        console.log("SngEndBroadcast.");
        socket.emit("LoadRoomInfoRequest");
      });

      socket.on("RoundEndBroadcast", () => {
        console.log("RoundEndBroadcast.");
        setRoomCurrentBetSize(0);
        setRoomCurrentMinRaise(0);
        updateCommunityCards([]);
        updatePots([]);
      });

      socket.on("LoadRoomInfoResponse", (response: Msg.LoadRoomInfoResponse) => {
        console.log("LoadRoomInfoResponse: " + JSON.stringify(response));
        loadRoomInfo(response);
      });

      socket.on("SignupResponse", (response: Msg.SignupResponse) => {
        console.log("SignupResponse: " + JSON.stringify(response));
        setClientSeatId(response.seatId);
      });

      socket.on("SignupBroadcast", (broadcast: Msg.SignupBroadcast) => { // Initialize player info, cannot use xxxUpdate, use xxxResponse instead.
        console.log("SignupBroadcast: " + JSON.stringify(broadcast));
        updatePlayerName(broadcast.seatId, broadcast.name);
        updatePlayerCurrentStatus(broadcast.seatId, PlayerStatus.NONE);
      });

      socket.on("ReadyResponse", (response: Msg.ReadyResponse) => {
        console.log("ReadyResponse: " + JSON.stringify(response));
      });

      socket.on("FoldResponse", (response: Msg.FoldResponse) => {
        console.log("FoldResponse: " + JSON.stringify(response));
      });

      socket.on("CheckResponse", (response: Msg.CheckResponse) => {
        console.log("CheckResponse: " + JSON.stringify(response));
      });

      socket.on("CallResponse", (response: Msg.CallResponse) => {
        console.log("CallResponse: " + JSON.stringify(response));
      });

      socket.on("BetResponse", (response: Msg.BetResponse) => {
        console.log("BetResponse: " + JSON.stringify(response));
      });

      socket.on("RaiseResponse", (response: Msg.RaiseResponse) => {
        console.log("RaiseResponse: " + JSON.stringify(response));
      });

      socket.on("AllInResponse", (response: Msg.AllInResponse) => {
        console.log("AllInResponse: " + JSON.stringify(response));
      });

      // updates
      socket.on("ClientSeatIdUpdateBroadcast", (broadcast: Msg.ClientSeatIdUpdateBroadcast) => {
        console.log("ClientSeatIdUpdateBroadcast: " + JSON.stringify(broadcast));
        setClientSeatId(broadcast.clientSeatId);
      });

      socket.on("CurrentPlayerSeatIdUpdateBroadcast", (broadcast: Msg.CurrentPlayerSeatIdUpdateBroadcast) => {
        console.log("CurrentPlayerSeatIdUpdateBroadcast: " + JSON.stringify(broadcast));
        setCurrentPlayerSeatId(broadcast.currentPlayerSeatId);
      });

      socket.on("RoomCurrentBetSizeUpdateBroadcast", (broadcast: Msg.RoomCurrentBetSizeUpdateBroadcast) => {
        console.log("RoomCurrentBetSizeUpdateBroadcast: " + JSON.stringify(broadcast));
        setRoomCurrentBetSize(broadcast.roomCurrentBetSize);
      });

      socket.on("RoomCurrentMinRaiseUpdateBroadcast", (broadcast: Msg.RoomCurrentMinRaiseUpdateBroadcast) => {
        console.log("RoomCurrentMinRaiseUpdateBroadcast: " + JSON.stringify(broadcast));
        setRoomCurrentMinRaise(broadcast.roomCurrentMinRaise);
      });

      socket.on("RoomCurrentStatusUpdateBroadcast", (broadcast: Msg.RoomCurrentStatusUpdateBroadcast) => {
        console.log("RoomCurrentStatusUpdateBroadcast: " + JSON.stringify(broadcast));
        setRoomCurrentStatus(broadcast.roomCurrentStatus);
      });

      socket.on("PlayerNameUpdateBroadcast", (broadcast: Msg.PlayerNameUpdateBroadcast) => {
        console.log("PlayerNameUpdateBroadcast: " + JSON.stringify(broadcast));
        updatePlayerName(broadcast.seatId, broadcast.playerName);
      });

      socket.on("PlayerCurrentChipsUpdateBroadcast", (broadcast: Msg.PlayerCurrentChipsUpdateBroadcast) => {
        console.log("PlayerCurrentChipsUpdateBroadcast: " + JSON.stringify(broadcast));
        updatePlayerCurrentChips(broadcast.seatId, broadcast.playerCurrentChips);
      });

      socket.on("PlayerCurrentBetSizeUpdateBroadcast", (broadcast: Msg.PlayerCurrentBetSizeUpdateBroadcast) => {
        console.log("PlayerCurrentBetSizeUpdateBroadcast: " + JSON.stringify(broadcast));
        updatePlayerCurrentBetSize(broadcast.seatId, broadcast.playerCurrentBetSize);
      });

      socket.on("PlayerCurrentStatusUpdateBroadcast", (broadcast: Msg.PlayerCurrentStatusUpdateBroadcast) => {
        console.log("PlayerCurrentStatusUpdateBroadcast: " + JSON.stringify(broadcast));
        updatePlayerCurrentStatus(broadcast.seatId, broadcast.playerCurrentStatus);
      });

      socket.on("PlayerHoleCardsUpdateBroadcast", (broadcast: Msg.PlayerHoleCardsUpdateBroadcast) => {
        console.log("PlayerHoleCardsUpdateBroadcast: " + JSON.stringify(broadcast));
        updatePlayerHoleCards(broadcast.seatId, broadcast.playerHoleCards);
      });

      socket.on("CommunityCardsUpdateBroadcast", (broadcast: Msg.CommunityCardsUpdateBroadcast) => {
        console.log("CommunityCardsUpdateBroadcast: " + JSON.stringify(broadcast));
        updateCommunityCards(broadcast.communityCards);
      });

      socket.on("PotsUpdateBroadcast", (broadcast: Msg.PotsUpdateBroadcast) => {
        console.log("PotsUpdateBroadcast: " + JSON.stringify(broadcast));
        updatePots(broadcast.pots);
      });

      // Load room info every time the component mounts.
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
            seatId={0}
            name={playersNames[0]}
            currentChip={playersCurrentChips[0]}
            currentBetSize={playersCurrentBetSizes[0]}
            currentPlayerStatus={playersCurrentStatuses[0]}
            holeCards={playersHoleCards[0]}
            clientSeatId={clientSeatId}
            currentPlayerSeatId={currentPlayerSeatId}
            roomCurrentBetSize={roomCurrentBetSize}
            roomCurrentMinRaise={roomCurrentMinRaise}
            roomCurrentStatus={roomCurrentStatus}
          />
          <PlayerInfoCard
            socket={getSockets}
            seatId={1}
            name={playersNames[1]}
            currentChip={playersCurrentChips[1]}
            currentBetSize={playersCurrentBetSizes[1]}
            currentPlayerStatus={playersCurrentStatuses[1]}
            holeCards={playersHoleCards[1]}
            clientSeatId={clientSeatId}
            currentPlayerSeatId={currentPlayerSeatId}
            roomCurrentBetSize={roomCurrentBetSize}
            roomCurrentMinRaise={roomCurrentMinRaise}
            roomCurrentStatus={roomCurrentStatus}
          />
          <PlayerInfoCard
            socket={getSockets}
            seatId={2}
            name={playersNames[2]}
            currentChip={playersCurrentChips[2]}
            currentBetSize={playersCurrentBetSizes[2]}
            currentPlayerStatus={playersCurrentStatuses[2]}
            holeCards={playersHoleCards[2]}
            clientSeatId={clientSeatId}
            currentPlayerSeatId={currentPlayerSeatId}
            roomCurrentBetSize={roomCurrentBetSize}
            roomCurrentMinRaise={roomCurrentMinRaise}
            roomCurrentStatus={roomCurrentStatus}
          />
          <PlayerInfoCard
            socket={getSockets}
            seatId={3}
            name={playersNames[3]}
            currentChip={playersCurrentChips[3]}
            currentBetSize={playersCurrentBetSizes[3]}
            currentPlayerStatus={playersCurrentStatuses[3]}
            holeCards={playersHoleCards[3]}
            clientSeatId={clientSeatId}
            currentPlayerSeatId={currentPlayerSeatId}
            roomCurrentBetSize={roomCurrentBetSize}
            roomCurrentMinRaise={roomCurrentMinRaise}
            roomCurrentStatus={roomCurrentStatus}
          />
        </div>
        <div className={styles.second_row}>
          <PlayerInfoCard
            socket={getSockets}
            seatId={8}
            name={playersNames[8]}
            currentChip={playersCurrentChips[8]}
            currentBetSize={playersCurrentBetSizes[8]}
            currentPlayerStatus={playersCurrentStatuses[8]}
            holeCards={playersHoleCards[8]}
            clientSeatId={clientSeatId}
            currentPlayerSeatId={currentPlayerSeatId}
            roomCurrentBetSize={roomCurrentBetSize}
            roomCurrentMinRaise={roomCurrentMinRaise}
            roomCurrentStatus={roomCurrentStatus}
          />
          <div className={styles.desktop}>
            <div className={styles.pots}>
              {JSON.stringify(pots)}
            </div>
            <div className={styles.community_cards}>
              {communityCards.map((card, index) => (
                <Image
                  key={index}
                  src={`/pokers/${Card.toHumanReadableString(card)}.png`}
                  alt={Card.toHumanReadableString(card)}
                  width={60}
                  height={80}
                  style={{ objectFit: "contain" }}
                />
              ))}
            </div>
          </div>
          <PlayerInfoCard
            socket={getSockets}
            seatId={4}
            name={playersNames[4]}
            currentChip={playersCurrentChips[4]}
            currentBetSize={playersCurrentBetSizes[4]}
            currentPlayerStatus={playersCurrentStatuses[4]}
            holeCards={playersHoleCards[4]}
            clientSeatId={clientSeatId}
            currentPlayerSeatId={currentPlayerSeatId}
            roomCurrentBetSize={roomCurrentBetSize}
            roomCurrentMinRaise={roomCurrentMinRaise}
            roomCurrentStatus={roomCurrentStatus}
          />
        </div>
        <div className={styles.third_row}>
          <PlayerInfoCard
            socket={getSockets}
            seatId={7}
            name={playersNames[7]}
            currentChip={playersCurrentChips[7]}
            currentBetSize={playersCurrentBetSizes[7]}
            currentPlayerStatus={playersCurrentStatuses[7]}
            holeCards={playersHoleCards[7]}
            clientSeatId={clientSeatId}
            currentPlayerSeatId={currentPlayerSeatId}
            roomCurrentBetSize={roomCurrentBetSize}
            roomCurrentMinRaise={roomCurrentMinRaise}
            roomCurrentStatus={roomCurrentStatus}
          />
          <PlayerInfoCard
            socket={getSockets}
            seatId={6}
            name={playersNames[6]}
            currentChip={playersCurrentChips[6]}
            currentBetSize={playersCurrentBetSizes[6]}
            currentPlayerStatus={playersCurrentStatuses[6]}
            holeCards={playersHoleCards[6]}
            clientSeatId={clientSeatId}
            currentPlayerSeatId={currentPlayerSeatId}
            roomCurrentBetSize={roomCurrentBetSize}
            roomCurrentMinRaise={roomCurrentMinRaise}
            roomCurrentStatus={roomCurrentStatus}
          />
          <PlayerInfoCard
            socket={getSockets}
            seatId={5}
            name={playersNames[5]}
            currentChip={playersCurrentChips[5]}
            currentBetSize={playersCurrentBetSizes[5]}
            currentPlayerStatus={playersCurrentStatuses[5]}
            holeCards={playersHoleCards[5]}
            clientSeatId={clientSeatId}
            currentPlayerSeatId={currentPlayerSeatId}
            roomCurrentBetSize={roomCurrentBetSize}
            roomCurrentMinRaise={roomCurrentMinRaise}
            roomCurrentStatus={roomCurrentStatus}
          />
        </div>
      </div>
    </>
  )
};
