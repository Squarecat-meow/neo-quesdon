"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NameComponents from "./NameComponents";
import { AnswerDto } from "../_dto/Answers.dto";
import { userProfileDto } from "../_dto/fetch-profile/Profile.dto";

interface askProps {
  value: AnswerDto;
}

export async function fetchProfile(handle: string) {
  const profile = await fetch(`/api/db/fetch-profile/${handle}`);
  if (profile && profile.ok) {
    return profile.json() as unknown as userProfileDto;
  } else {
    return undefined;
  }
}

export default function Answer({ value }: askProps) {
  const [showNsfw, setShowNsfw] = useState(false);
  const [userInfo, setUserInfo] = useState<userProfileDto>();

  useEffect(() => {
    fetchProfile(value.answeredPersonHandle).then((r) => setUserInfo(r));
    setShowNsfw(!value.nsfwedAnswer);
  }, [value.answeredPersonHandle, value.nsfwedAnswer]);

  return (
    <div className="w-full glass rounded-box px-2 desktop:px-8 py-4 mb-2 shadow">
      {!showNsfw && (
        <div className="fixed top-0 left-0 z-10 gap-2 w-full h-full flex flex-col justify-center items-center">
          <span>답변자가 NSFW로 체크한 질문이에요!</span>
          <button className="btn" onClick={() => setShowNsfw(!showNsfw)}>
            질문 보기
          </button>
        </div>
      )}

      <div className={`${!showNsfw && "blur"} w-full h-full`}>
        <div className="chat chat-start">
          <div className="chat-header">
            {value.questioner ? value.questioner : "익명의 질문자"}
          </div>
          <div className="flex items-center text-sm window:text-xl desktop:text-2xl chat-bubble">
            {value.question}
          </div>
        </div>
        <div className="chat chat-end">
          <div className="chat-image avatar">
            <div className="w-12 rounded-full">
              <Link href={`/main/user/${value.answeredPersonHandle}`}>
                <img src={userInfo?.avatarUrl} alt="answered person avatar" />
              </Link>
            </div>
          </div>
          <div className="chat-header text-blue-500">
            <Link href={`/main/user/${value.answeredPersonHandle}`}>
              <NameComponents
                username={userInfo?.name}
                width={16}
                height={16}
              />
            </Link>
          </div>
          <div className="flex items-center text-sm window:text-xl desktop:text-2xl chat-bubble bg-green-700">
            <Link href={`/main/user/${value.answeredPersonHandle}`}>
              {value.answer}
            </Link>
          </div>
          <div className="chat-footer font-thin text-xs mt-2 underline text-blue-900">
            <Link href={`/main/user/${value.answeredPersonHandle}/${value.id}`}>
              {value.answeredAt.toLocaleString()}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
