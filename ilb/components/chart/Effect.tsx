import { ReactNode, useEffect, useRef, useState, DependencyList } from "react";

type PropsType = {
  children: ReactNode;
  deps: DependencyList;
  animationName: string;
};

const Effect = ({ children, deps, animationName }: PropsType) => {
  const [effect, setEffect] = useState<boolean>(true);

  useEffect(() => setEffect(true), deps);

  return (
    <>
      <div className={`${effect && animationName}`} onAnimationEnd={() => setEffect(false)}>
        {children}
      </div>
    </>
  );
};
export default Effect;
