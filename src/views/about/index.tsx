import { FC, memo } from "react";
import { useNavigate } from "react-router-dom";
import style from "./style.less";
type IProps = {};
const Index: FC<IProps> = () => {
  const navigate = useNavigate();
  return (
    <div className={style.title}>
      About
      <button
        onClick={() => {
          navigate(-1);
        }}
      >
        返回
      </button>
    </div>
  );
};
Index.displayName = "About";
export default memo(Index);
