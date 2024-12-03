import { Button } from "@/components/ui/button";

export default function InstructionSection({
  onStart,
}: {
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 text-white">
      <h1 className="text-2xl font-semibold">Instructions</h1>
      <ol className="list-decimal list-inside space-y-1 text-base">
        <li>Ensure stable internet and choose a clean, quiet location.</li>
        <li>
          Permission for access to camera, microphone, and entire screen sharing
          is required.
        </li>
        <li>Be in professional attire and avoid distractions.</li>
        <li>
          Give a detailed response, providing as much information as you can.
        </li>
        <li>
          Answer the question with examples and projects you&apos;ve worked on.
        </li>
      </ol>
      <Button
        className="w-full bg-violet-700 font-semibold hover:bg-violet-500 mt-4"
        onClick={onStart}
      >
        Start Now
      </Button>
    </div>
  );
}
