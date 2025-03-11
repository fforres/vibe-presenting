import { useAgent } from "agents-sdk/react";
import { useParams } from "react-router";

export const SinglePresentation = () => {
  const { id } = useParams();
  // const agent = useAgent({
  //   agent: "chat",
  //   name: id,
  // });
  return <div>SinglePresentation {id}</div>;
};
