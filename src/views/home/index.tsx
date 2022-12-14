import { FC, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './style.less'

type IProps = {};
const Index: FC<IProps> = () => {
  const navigate =  useNavigate()
  return <div className={style.title}>
    home
    <img className={style.img} src="/src/assets/imgs/123.jpeg" alt="" />
    <button onClick={()=>{
      navigate('/about')
    }}>关于我们</button>
  </div>;
};
Index.displayName ='Index'
export default memo(Index);
