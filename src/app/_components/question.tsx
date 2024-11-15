import { SubmitHandler, useForm } from "react-hook-form";
import type { questions } from "..";
import { getQuestion, postAnswer } from "../main/questions/action";

interface formValue {
  answer: string;
  nsfw: boolean;
}

interface askProps {
  value: questions;
}

export default function Question({ value }: askProps) {
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<formValue>({
    defaultValues: {
      answer: "",
      nsfw: false,
    },
  });

  const onCtrlEnter = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      trigger();

      const value = getValues();

      if (value) {
        await onSubmit(value);
      }
    }
  };

  const nsfwedAnswer = watch("nsfw");

  const onSubmit: SubmitHandler<formValue> = async (e) => {
    const question = await getQuestion(value.id);
    const typedAnswer = {
      question: question!.question,
      questioner: question!.questioner,
      answer: e.answer,
      answeredPersonHandle: question!.questioneeHandle,
      nsfwedAnswer: e.nsfw,
    };

    postAnswer(question, typedAnswer).then(() => {
      document.getElementById("my_modal_1")?.click();
    });
  };

  return (
    <div className="rounded-box p-2 desktop:p-4 mb-2 glass shadow">
      <div className="text-2xl chat chat-start">
        <div className="chat-header">
          {value.questioner ? value.questioner : "익명의 질문자"}
        </div>
        <div className="chat-bubble flex items-center text-sm window:text-xl desktop:text-2xl">
          {value.question}
        </div>
        <div className="chat-footer opacity-50">
          {value.questionedAt.toLocaleString()}
          <span
            className="text-red-500 font-bold ml-2 cursor-pointer"
            onClick={() =>
              document.getElementById("question_delete_modal")?.click()
            }
          >
            삭제
          </span>
        </div>
      </div>
      <div className="text-2xl chat chat-end">
        <div className="chat-bubble bg-green-700">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2 py-2"
          >
            <textarea
              {...register("answer", { required: "required" })}
              className={`textarea textarea-sm text-sm window:text-xl desktop:text-2xl bg-transparent ${
                errors.answer && "textarea-error"
              }`}
              placeholder="답변을 입력하세요..."
              onKeyDown={onCtrlEnter}
            />
            <div className="w-full flex justify-between items-center">
              <div className="flex gap-2 items-center text-xl">
                <input
                  type="checkbox"
                  className="toggle toggle-accent"
                  onClick={() => setValue("nsfw", !nsfwedAnswer)}
                />
                <input type="hidden" {...register("nsfw")} />
                <span className="text-lg desktop:text-2xl">NSFW로 체크</span>
              </div>
              <button type={"submit"} className="btn btn-outline">
                답변
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
