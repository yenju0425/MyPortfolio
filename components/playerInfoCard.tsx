import React, { useState } from 'react';
import { Socket } from "socket.io-client";
import { RoomStatus, PlayerStatus } from '@/games/base/terms';
import { Card } from '@/games/sng/modules/deck';
import styles from '@/styles/Player.module.css';
import * as Msg from "@/types/messages";

interface PlayerInfoCardProps {
  socket: () => Socket;
  seatId: number;
  name: string;
  currentChip: number | null;
  currentBetSize: number | null;
  currentPlayerStatus: PlayerStatus | null;
  holeCards: (Card | null)[];
  clientSeatId: number;
  currentPlayerSeatId: number;
  roomCurrentBetSize: number;
  roomCurrentStatus: RoomStatus;
}

const PlayerInfoCard = (props: PlayerInfoCardProps) => {

  // show control
  const isShowControl = props.roomCurrentStatus === RoomStatus.NONE && (props.clientSeatId === props.seatId || (props.clientSeatId === -1 && props.currentPlayerStatus === null));

  // show info
  const isShowInfo = props.currentPlayerStatus !== null && props.currentPlayerStatus !== PlayerStatus.ELIMINATED && props.currentPlayerStatus !== PlayerStatus.QUIT;

  // show form
  const [isShowForm, setShowForm] = useState(false);
  const toggleForm = () => {
    setShowForm(!isShowForm);
  };

  const isReady = props.currentPlayerStatus === PlayerStatus.READY;
  const isCurrentPlayer = props.currentPlayerSeatId === props.seatId;

  // form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');

  // client events:
  const signUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const request: Msg.SignupRequest = { seatId: props.seatId, name: formName, email: formEmail };
    props.socket().emit("SignupRequest", request);

    toggleForm();
  };

  const ready = () => {
    props.socket().emit("ReadyRequest");
  };

  // control button text
  const getControlButtonText = (): string => {
    if (props.currentPlayerStatus === null) {
      return 'Sign Up';
    } else if (props.currentPlayerStatus === PlayerStatus.NONE) {
      return 'Ready';
    } else {
      return 'Leave';
    }
  };

  // contorl button event
  const controlButtonEvent = () => {
    if (props.currentPlayerStatus === null) {
      toggleForm();
    } else if (props.currentPlayerStatus === PlayerStatus.NONE) {
      ready();
    } else {
      console.log('Invalid operation');
    }
  };

  return (
    <div className={styles.player_info_card}>
      {isShowControl && (
        <div>
          {!isShowForm && (
            <div className={styles.controlContainer}>
              <button onClick={controlButtonEvent}>
                {getControlButtonText()}
              </button>
            </div>
          )}
          {isShowForm && (
            <form onSubmit={signUp}>
              <input type="text" value={formName} onChange={(event) => setFormName(event.target.value)} placeholder="Name" />
              <input type="text" value={formEmail} onChange={(event) => setFormEmail(event.target.value)} placeholder="Email" />
              <button type="submit">Submit</button>
              <button type="button" onClick={toggleForm}>Cancel</button>
            </form>
          )}
        </div>
      )}
      
      {isShowInfo && (
        <div>
          <div className={styles.name}>
            <div>
              {props.name} 
            </div>
            {isReady && (
              <div>✅</div>
            )}
            {isCurrentPlayer && (
              <div>🕓</div>
            )}
          </div>
          <p>Current Chip: {props.currentChip}</p>
          <p>Bet Size: {props.currentBetSize}</p>
          <div className={styles.holeCards}>
            <div>
              {JSON.stringify(props.holeCards[0])}
            </div>
            <div>
              {JSON.stringify(props.holeCards[1])}
            </div>
          </div>
          <div>
            <button className={styles.fold}>Fold</button>
            <button className={styles.check}>Check</button>
            <button className={styles.call}>Call</button>
            <button className={styles.bet}>Bet</button>
            <button className={styles.raise}>Raise</button>
            <button className={styles.all_in}>All In</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerInfoCard;