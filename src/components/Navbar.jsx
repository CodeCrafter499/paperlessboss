import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const LOGO_SRC = 'data:image/x-icon;base64,AAABAAMAEBAAAAEAIABoBAAANgAAACAgAAABACAAKBEAAJ4EAAAwMAAAAQAgAGgmAADGFQAAKAAAABAAAAAgAAAAAQAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKpV/36qVf/5qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/+apV/36qVf/5qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf/5qlX//6pV//+qVf//qlX//7hy//+5c///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///r1////////717//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//69f////////Eiv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//+LE////////yZP//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Ro////////9Gi//+4cv//yZT//8GD//+rV///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//u3j////////hw///zJn//+fO///+/v//7t7//7Fj//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pW///27f//8ub//6pV//+qVf//0aT////////jxv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//1q3///7+//+tW///qlX//7Vq/////////fz//6xa//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Bi///37///tGn//6pV//+2bf////////7+//+uXP//qlX//6pV//+qVf//qlX//6pV//+qVf//q1f//+vY///Tpv//wID//69g//+3cP//5s3////////n0P//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+0af//5Mn///79//////////////7+///ly///sWL//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+xY///v3///75+//+xZP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/+apV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/+apV/36qVf/5qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/+apV/34AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAACAAAABAAAAAAQAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAA/wKpVP98qlX/56pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/56lU/3yAAP8CqVT/fKpV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6lU/3yqVf/nqlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qlX//6pV//6pV//6pV//6pV//6pV//6pV//6pV//6pV//56pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Vs///Ysf//06b//718//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//1Kn//////////////////8iQ//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///ZtP//////////////////2LL//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//9q0///////////////////du///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//1av//////////////////+HE//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Ll///////////////////5s3//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//758///////////////////q1v//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//rl3///79//////////////Di//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//79///////////////fr//6xY//+zaP//2rb//+jS///q1v//48f//86d//+vX///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///ZtP//////////////////unb//9Wr//////////////////////////////jy///Eif//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8GE///////////////////Mmv//qlX//7Fk///ChP//27f///37//////////////79///FjP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//rFn///r1/////////////969//+qVf//qlX//6pV//+qVf//wIH///38//////////////v2//+0af//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//4MH/////////////7t7//6pV//+qVf//qlX//6pV//+qVf//37///////////////////927//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Agf/////////////8+v//q1f//6pV//+qVf//qlX//6pV///Fi///////////////////+fP//6pW//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///w4f////////////+1bP//qlX//6pV//+qVf//qlX//7p1////////////////////////tGj//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8SJ/////////////717//+qVf//qlX//6pV//+qVf//uXT///////////////////////+2bf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//96+////////v3///6pV//+qVf//qlX//6pV///Klf///////////////////fz//61b//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//65e///69f//4sb//7l0//+qVf//q1f//8yZ//+xYv//qlX//6pV//+qVf//sWP///Pn///////////////////nz///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//9On//////////7//+nS///Nm///u3f//7Jl//+xZP//unX//9Ch///27f///////////////////fv//7p2//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//9Kl///9+/////////////////////////////////////////////////////////z4///Fi///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//4sb//7Zt///evf//+/j///////////////////////////////////38///ixv//tm7//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+tXP//woX//9Ci///Xr///1q7//9Ci///Dh///r2D//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf/nqlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/56lU/3yqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVP98gAD/AqlU/3yqVf/nqlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf/nqVT/fIAA/wIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAADAAAABgAAAAAQAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACqVf8PqVP/XKpV/8apVf/3qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+pVf/3qlX/xqlT/1yqVf8PAAAAAKpV/w+pVP+VqlT/+KpV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//epVP+VqlX/D6lT/1yqVf/3qlX//6pV//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVP/4qVP/XKpV/8aqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/xqlV//eqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qVX/96pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6lV//eqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qVX/96pV/8aqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/xqlT/1yqVP/4qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf/3qVP/XKpV/w+pVP+VqlX/96pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pU//ipVP+VqlX/DwAAAACqVf8PqVP/XKpV/8apVf/3qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+pVf/3qlX/xqlT/1yqVf8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

export default function Navbar({ theme, setTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        <img src={LOGO_SRC} alt="PaperlessBoss logo" className={styles.logoImg} />
        <div className={styles.brandInfo}>
          <span className={styles.brandName}>PaperlessBoss</span>
          <span className={styles.brandSub}>Labour Compliance Platform</span>
        </div>
      </Link>

      <div className={styles.links}>
        <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ''}`}>
          Home
        </NavLink>
        <a href="#features" className={styles.link}>
          Features
        </a>
        <a href="#pricing" className={styles.link}>
          Pricing
        </a>
        <div className={styles.dropdown}>
          <span className={styles.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            Resources <ChevronDown size={14} />
          </span>
          <div className={styles.dropdownMenu}>
            <a href="#knowledge-center" className={styles.dropdownItem}>
              <span>📘</span> Knowledge Centre
            </a>
            <a href="#templates" className={styles.dropdownItem}>
              <span>📄</span> Free Templates
            </a>
            <a href="#faqs" className={styles.dropdownItem}>
              <span>❓</span> FAQs
            </a>
            <a href="#updates" className={styles.dropdownItem}>
              <span>📢</span> Updates
            </a>
          </div>
        </div>
        <a href="#contact" className={styles.link}>
          Contact
        </a>
        {user && (
          <NavLink to="/app" className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ''}`}>
            Dashboard
          </NavLink>
        )}
      </div>

      <div className={styles.actions}>
        <button onClick={toggleTheme} className={styles.themeBtn} title="Toggle Theme">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {user ? (
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />
            <span style={{ verticalAlign: 'middle' }}>Sign out</span>
          </button>
        ) : (
          <>
            <Link to="/login" className={styles.loginBtn}>
              Login
            </Link>
            <Link to="/signup" className={styles.signupBtn}>
              Start Free Trial
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
