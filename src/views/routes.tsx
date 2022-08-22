import { RouteObject } from "react-router-dom";
import { lazy } from "react";
// 如果用webpackChunkName这个注释去声明懒加载的组件可以去自定义名字，不然默认名字会加上从src到文件所在文件夹作为下划线这么长的名字，不友好
const Home = lazy(() => import(/* webpackChunkName: "home" */ "./home"));
const About = lazy(() => import(/* webpackChunkName: "about" */ "./about"));
// import Home from './home'

const routers: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <About />,
  },
];

export { routers };
