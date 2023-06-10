import React, { useState } from 'react';
import styles from '../styles/Player.module.css';
import { RoomStatus, PlayerStatus } from '../games/base/terms';
import io, { Socket } from "socket.io-client";
import { ServerEvents, ClientEvents } from "../games/sng/socketEvents";
import * as Msg from "../types/messages";

interface PlayerInfoCardProps {
  socket: Socket;
  id: number;
  name: string;
  currentChip: number;
  currentBetSize: number;
  currentPlayerStatus: PlayerStatus;
  currentRoomStatus: RoomStatus;
  playerSeatId: number;
}

const PlayerInfoCard = ({socket, id, name, currentChip, currentBetSize, currentPlayerStatus, currentRoomStatus, playerSeatId}: PlayerInfoCardProps) => {

  // show control
  const isShowControl = currentRoomStatus === RoomStatus.NONE && (playerSeatId === -1 || playerSeatId === id);

  // control button text
  const [controlButtonText, setControlButtonText] = useState('Sign Up');
  const getControlButtonText = (): string => {
    if (currentPlayerStatus === PlayerStatus.NONE) {
      return 'Sign Up';
    } else if (currentPlayerStatus === PlayerStatus.SIT) {
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

    const signUpReq: Msg.SignupRequest = { id: id, name: formName, email: formEmail };
    socket.emit(ClientEvents.signup, signUpReq);
  };

  return (
    <div className={styles.player_info_card}>
      {isShowControl && (
        <div>
          {!isShowForm && (
            <button className={styles.Control} onClick={toggleForm}>
              {controlButtonText}
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
      
      {currentPlayerStatus !== PlayerStatus.NONE && currentPlayerStatus !== PlayerStatus.ELIMINATED && (
        <div>
          <h2>{name}</h2>
          <p>Current Chip: {currentChip}</p>
          <p>Bet Size: {currentBetSize}</p>
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