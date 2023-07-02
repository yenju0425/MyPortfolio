import Image from 'next/image';
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
  holeCards: Card[];
  clientSeatId: number;
  currentPlayerSeatId: number | null;
  roomCurrentBetSize: number;
  roomCurrentMinRaise: number;
  roomCurrentStatus: RoomStatus;
}

const PlayerInfoCard = (props: PlayerInfoCardProps) => {
  const isShowControl = props.roomCurrentStatus === RoomStatus.NONE && (props.clientSeatId === props.seatId || (props.clientSeatId === -1 && props.currentPlayerStatus === null));
  const isShowInfo = props.currentPlayerStatus !== null && props.currentPlayerStatus !== PlayerStatus.ELIMINATED && props.currentPlayerStatus !== PlayerStatus.QUIT;
  const isReady = props.currentPlayerStatus === PlayerStatus.READY;
  const isCurrentPlayer = props.currentPlayerSeatId === props.seatId;
  const isCanAct = isCurrentPlayer && props.currentPlayerSeatId === props.clientSeatId;

  const minBetAmount = props.roomCurrentBetSize + props.roomCurrentMinRaise - props.currentBetSize;

  // const isShowFoldButton = true;
  const isShowCheckButton = props.roomCurrentBetSize == props.currentBetSize;
  const isShowCallButton = props.roomCurrentBetSize > props.currentBetSize && props.currentChip > props.roomCurrentBetSize - props.currentBetSize;
  const isShowBetButton = props.roomCurrentBetSize == 0 && props.currentChip >= minBetAmount;
  const isShowRaiseButton = props.roomCurrentBetSize > 0 && props.currentChip >= minBetAmount;
  const isShowAllInButton = props.currentChip < minBetAmount;

  const [isShowSignupForm, setIsShowSignupForm] = useState(false);
  const [signupFormName, setSignupFormName] = useState('');
  const [signupFormEmail, setSignupFormEmail] = useState('');

  const [isShowBetForm, setIsShowBetForm] = useState(false);
  const [betFormBetAmount, setBetFormBetAmount] = useState(0);

  const [isShowRaiseForm, setIsShowRaiseForm] = useState(false);
  const [raiseFormRaiseAmount, setRaiseFormRaiseAmount] = useState(0);

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

  const bet = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const request: Msg.BetRequest = {
      betAmount: betFormBetAmount
    };
    props.socket().emit("BetRequest", request);

    toggleBetForm();
  };

  const raise = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const request: Msg.RaiseRequest = {
      raiseAmount: raiseFormRaiseAmount
    };
    props.socket().emit("RaiseRequest", request);

    toggleRaiseForm();
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

  const toggleRaiseForm = () => {
    setIsShowRaiseForm(!isShowRaiseForm);
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
      <div style={{ visibility: isShowControl ? 'visible' : 'hidden' }}>
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
          <div className={styles.chip}>
            <div style={{ visibility: props.roomCurrentStatus == RoomStatus.PLAYING ? 'visible' : 'hidden' }}>
              💰: {props.currentChip}
            </div>
            <div style={{ visibility: props.roomCurrentStatus == RoomStatus.PLAYING && props.currentBetSize > 0 ? 'visible' : 'hidden' }}>
              🔺: {props.currentBetSize}
            </div>
          </div>
          <div className={styles.hole_cards}>
            {props.holeCards.map((card, index) => (
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
          {isCanAct && (
            <div>
              {!isShowBetForm && !isShowRaiseForm && (
                <div>
                  <button className={styles.fold} onClick={fold}>Fold</button>

                  {isShowCheckButton && (
                    <button className={styles.check} onClick={check}>Check</button>
                  )}

                  {isShowCallButton && (
                    <button className={styles.call} onClick={call}>Call</button>
                  )}

                  {isShowBetButton && (
                    <button className={styles.bet} onClick={toggleBetForm}>Bet</button>
                  )}

                  {isShowRaiseButton && (
                    <button className={styles.raise} onClick={toggleRaiseForm}>Raise</button>
                  )}

                  {isShowAllInButton && (
                    <button className={styles.allin} onClick={allIn}>All In</button>
                  )}
                </div>
              )}
              {isShowBetForm && (
                <form onSubmit={bet}>
                  <input type="number" value={betFormBetAmount || ''} onChange={(event) => setBetFormBetAmount(event.target.valueAsNumber)} placeholder={`>= ${minBetAmount}`}/>
                  <button type="submit">Bet</button>
                  <button type="button" onClick={toggleBetForm}>Cancel</button>
                </form>
              )}
              {isShowRaiseForm && (
                <form onSubmit={raise}>
                  <input type="number" value={raiseFormRaiseAmount || ''} onChange={(event) => setRaiseFormRaiseAmount(event.target.valueAsNumber)} placeholder={`>= ${minBetAmount}`}/>
                  <button type="submit">Raise</button>
                  <button type="button" onClick={toggleRaiseForm}>Cancel</button>
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