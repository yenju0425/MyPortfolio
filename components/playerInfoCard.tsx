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
  currentChip: number;
  currentBetSize: number;
  currentPlayerStatus: PlayerStatus | null;
  holeCards: (Card | null)[];
  clientSeatId: number;
  currentPlayerSeatId: number;
  roomCurrentBetSize: number;
  roomCurrentStatus: RoomStatus;
}

const PlayerInfoCard = (props: PlayerInfoCardProps) => {
  const isShowControl = props.roomCurrentStatus === RoomStatus.NONE && (props.clientSeatId === props.seatId || (props.clientSeatId === -1 && props.currentPlayerStatus === null));
  const isShowInfo = props.currentPlayerStatus !== null && props.currentPlayerStatus !== PlayerStatus.ELIMINATED && props.currentPlayerStatus !== PlayerStatus.QUIT;
  const isReady = props.currentPlayerStatus === PlayerStatus.READY;
  const isCurrentPlayer = props.currentPlayerSeatId === props.seatId;
  const isCanAct = isCurrentPlayer && props.currentPlayerSeatId === props.clientSeatId;

  const [isShowSignupForm, setIsShowSignupForm] = useState(false);
  const [signupFormName, setSignupFormName] = useState('');
  const [signupFormEmail, setSignupFormEmail] = useState('');

  const [isShowBetForm, setIsShowBetForm] = useState(false);
  const [betFormBetSize, setBetFormBetSize] = useState(0);

  const signup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const request: Msg.SignupRequest = {
      seatId: props.seatId,
      name: signupFormName,
      email: signupFormEmail
    };
    props.socket().emit("SignupRequest", request);

    toggleSignupForm();
  };

  const ready = () => {
    props.socket().emit("ReadyRequest");
  };

  const fold = () => {
    props.socket().emit("FoldRequest");
  };

  const check = () => {
    props.socket().emit("CheckRequest");
  };

  const call = () => {
    props.socket().emit("CallRequest");
  };

  const bet = () => {
    const request: Msg.BetRequest = {
      betSize: betFormBetSize
    };
    props.socket().emit("BetRequest", request);
  };

  const raise = () => {
    props.socket().emit("RaiseRequest");
  };

  const allIn = () => {
    props.socket().emit("AllInRequest");
  };

  const toggleSignupForm = () => {
    setIsShowSignupForm(!isShowSignupForm);
  };

  const toggleBetForm = () => {
    setIsShowBetForm(!isShowBetForm);
  };

  const getControlButtonText = (): string => {
    if (props.currentPlayerStatus === null) {
      return 'Signup';
    } else if (props.currentPlayerStatus === PlayerStatus.NONE) {
      return 'Ready';
    } else {
      return 'Leave';
    }
  };

  const control = () => {
    if (props.currentPlayerStatus === null) {
      toggleSignupForm();
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
          {!isShowSignupForm && (
            <div className={styles.controlContainer}>
              <button onClick={control}>
                {getControlButtonText()}
              </button>
            </div>
          )}
          {isShowSignupForm && (
            <form onSubmit={signup}>
              <input type="text" value={signupFormName} onChange={(event) => setSignupFormName(event.target.value)} placeholder="Name"/>
              <input type="text" value={signupFormEmail} onChange={(event) => setSignupFormEmail(event.target.value)} placeholder="Email"/>
              <button type="submit">Signup</button>
              <button type="button" onClick={toggleSignupForm}>Cancel</button>
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
          {isCanAct && (
            <div>
              {!isShowBetForm && (
                <div>
                  <button className={styles.fold} onClick={fold}>Fold</button>

                  {props.roomCurrentBetSize == props.currentBetSize && (
                    <button className={styles.check} onClick={check}>Check</button>
                  )}

                  {props.roomCurrentBetSize > props.currentBetSize && (
                    <button className={styles.call} onClick={call}>Call</button>
                  )}

                  {props.roomCurrentBetSize == 0 && (
                    <button className={styles.bet} onClick={toggleBetForm}>Bet</button>
                  )}

                  {props.roomCurrentBetSize > 0 && props.roomCurrentBetSize < props.currentChip && (
                    <button className={styles.raise} onClick={raise}>Raise</button>
                  )}

                  {props.roomCurrentBetSize >= props.currentChip && (
                    <button className={styles.allin} onClick={allIn}>All In</button>
                  )}
                </div>
              )}
              {isShowBetForm && (
                <form onSubmit={bet}>
                  <input type="number" value={betFormBetSize || ''} onChange={(event) => setBetFormBetSize(event.target.valueAsNumber)} placeholder="Bet Size"/>
                  <button type="submit">Bet</button>
                  <button type="button" onClick={toggleBetForm}>Cancel</button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerInfoCard;