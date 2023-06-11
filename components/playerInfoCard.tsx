import React, { useState } from 'react';
import styles from '../styles/Player.module.css';
import { RoomStatus, PlayerStatus } from '../games/base/terms';
import { Socket } from "socket.io-client";
import * as Msg from "../types/messages";

interface PlayerInfoCardProps {
  socket: () => Socket;
  id: number;
  name: string;
  currentChip: number;
  currentBetSize: number;
  currentPlayerStatus: PlayerStatus | null;
  currentRoomStatus: RoomStatus;
  playerId: number;
}

const PlayerInfoCard = (props: PlayerInfoCardProps) => {

  // show control
  const isShowControl = props.currentRoomStatus === RoomStatus.NONE && (props.playerId === props.id || (props.playerId === -1 && props.currentPlayerStatus === null));

  // show info
  const isShowInfo = 1; //props.currentPlayerStatus !== null && props.currentPlayerStatus !== PlayerStatus.ELIMINATED && props.currentPlayerStatus !== PlayerStatus.QUIT;

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

  // show form
  const [isShowForm, setShowForm] = useState(false);
  const toggleForm = () => {
    setShowForm(!isShowForm);
  };

  // form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');

  // Client events:
  const signUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const request: Msg.SignupRequest = { id: props.id, name: formName, email: formEmail };
    props.socket().emit("SignupRequest", request);

    toggleForm();
  };

  return (
    <div className={styles.player_info_card}>
      {isShowControl && (
        <div>
          {!isShowForm && (
            <button className={styles.Control} onClick={toggleForm}>
              {getControlButtonText()}
            </button>
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
          <h2>{props.name}</h2>
          <p>Current Chip: {props.currentChip}</p>
          <p>Bet Size: {props.currentBetSize}</p>
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