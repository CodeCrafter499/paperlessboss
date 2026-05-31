import React, { useState, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, RefreshCw, CheckCircle, PartyPopper } from 'lucide-react';
import { authApi } from '../utils/authApi';
import { useSeo } from '../hooks/useSeo';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

// Inline base64 logo so it works without a public/ folder reference
const LOGO_SRC = 'data:image/x-icon;base64,AAABAAMAEBAAAAEAIABoBAAANgAAACAgAAABACAAKBEAAJ4EAAAwMAAAAQAgAGgmAADGFQAAKAAAABAAAAAgAAAAAQAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKpV/36qVf/5qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/+apV/36qVf/5qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf/5qlX//6pV//+qVf//qlX//7hy//+5c///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///r1////////717//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//69f////////Eiv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//+LE////////yZP//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Ro////////9Gi//+4cv//yZT//8GD//+rV///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//u3j////////hw///zJn//+fO///+/v//7t7//7Fj//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pW///27f//8ub//6pV//+qVf//0aT////////jxv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//1q3///7+//+tW///qlX//7Vq/////////fz//6xa//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Bi///37///tGn//6pV//+2bf////////7+//+uXP//qlX//6pV//+qVf//qlX//6pV//+qVf//q1f//+vY///Tpv//wID//69g//+3cP//5s3////////n0P//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+0af//5Mn///79//////////////7+///ly///sWL//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+xY///v3///75+//+xZP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/+apV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/+apV/36qVf/5qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/+apV/34AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAACAAAABAAAAAAQAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAA/wKpVP98qlX/56pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/56lU/3yAAP8CqVT/fKpV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6lU/3yqVf/nqlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/56pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Vs///Ysf//06b//718//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//1Kn//////////////////8iQ//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///ZtP//////////////////2LL//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//9q0///////////////////du///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//1av//////////////////+HE//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Ll///////////////////5s3//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//758///////////////////q1v//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//rl3///79//////////////Di//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//79///////////////fr//6xY//+zaP//2rb//+jS///q1v//48f//86d//+vX///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///ZtP//////////////////unb//9Wr//////////////////////////////jy///Eif//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8GE///////////////////Mmv//qlX//7Fk///ChP//27f///37//////////////79///FjP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//rFn///r1/////////////969//+qVf//qlX//6pV//+qVf//wIH///38//////////////v2//+0af//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//4MH/////////////7t7//6pV//+qVf//qlX//6pV//+qVf//37///////////////////927//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Agf/////////////8+v//q1f//6pV//+qVf//qlX//6pV///Fi///////////////////+fP//6pW//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///w4f////////////+1bP//qlX//6pV//+qVf//qlX//7p1////////////////////////tGj//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8SJ/////////////717//+qVf//qlX//6pV//+qVf//uXT///////////////////////+2bf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//96+////////v3///6pV//+qVf//qlX//6pV///Klf///////////////////fz//61b//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//65e///69f//4sb//7l0//+qVf//q1f//8yZ//+xYv//qlX//6pV//+qVf//sWP///Pn///////////////////nz///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//9On//////////7//+nS///Nm///u3f//7Jl//+xZP//unX//9Ch///27f///////////////////fv//7p2//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//9Kl///9+/////////////////////////////////////////////////////////z4///Fi///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Zt///evf//+/j///////////////////////////////////38///ixv//tm7//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+tXP//woX//9Ci///Xr///1q7//9Ci///Dh///r2D//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf/nqlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/56lU/3yqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+pVP98gAD/AqlU/3yqVf/nqlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf/nqVT/fIAA/wIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAADAAAABgAAAAAQAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACqVf8PqVP/XKpV/8apVf/3qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+pVf/3qlX/xqlT/1yqVf8PAAAAAKpV/w+pVP+VqlT/+KpV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//epVP+VqlX/D6lT/1yqVf/3qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVP/4qVP/XKpV/8aqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/xqlV//eqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qVX/96pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+rWP//rVz//6tX//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Bi///gw///8uX///Dg///hw///wYP//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7hx///8+v///////////////////////8+g//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//759/////////////////////////////+/g//+rWP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8GE//////////////////////////////Ll//+vXv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8KE//////////////////////////////Pn//+xZP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//759//////////////////////////////Tq//+1av//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7hy///+/P////////////////////////Xs//+4cP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Zt///38P////////////////////////bu//+7d///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Nn///v4P////////////////////////fw//++fP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Bh///mzP////////////////////////jy///Bg///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6xZ///atv////////////////////////r0///Eiv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Onv///fv///////////////////z5///Mmf//qlX//6pV//+rV///tGr//717///Agf//wIH//7t3//+wYf//qlb//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Bg///+PL////////////////////+///Xrv//q1f//69g///cuf//9Oj///fv///48f//+PH///bu///y5P//3rz//7ly//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+zZ///8+f////////////////////////ixf//rl7//8CC///+/P////////////////////////////////////////v4///TqP//sGH//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVv//5Mv////////////////////////u3f//s2b//7Jm///Spf//3r7//+nT///27v///v7////////////////////////9+///4cP//7Jl//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//ypX////////////////////////69f//t27//6pV//+rVv//rVz//7Fj//+2bf//zp3///n0/////////////////////////v7//+XL//+vX///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//sGH///z5////////////////////////xIn//6pV//+qVf//qlX//6pV//+qVf//qlX//7p1///y5f////////////////////////36///RpP//q1j//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//+PI////////////////////////1q7//6pV//+qVf//qlX//6pV//+qVf//qlX//6tX///Klf//+/b////////////////////////y5f//tm3//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8OI/////v//////////////////6NL//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+vYP//8eP////////////////////////+/v//0aT//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7No///w4f//////////////////+PH//6pW//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//3Ln/////////////////////////////8OH//6pW//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6xa///Zsv///v3//////////////////7Nn//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//zJj//////////////////////////////v3//7Fk//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+/gP//+PH//////////////////8CB//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//w4f//////////////////////////////////716//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+rV///4cT//////////////////8mS//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//woX//////////////////////////////////79///+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//tWz///Lm/////////////82b//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//zJr//////////////////////////////////7hy//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8CB///38P///////8ya//+qVf//qlX//6pV//+qVf//qlX//6pV//+rV///5s3/////////////////////////////+/f//6xZ//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//tGn///r2///s2f//xoz//7Fk//+rV///qlX//6pW///BhP//69f//716//+qVf//qlX//6pV//+qVf//qlX//6tX///DiP//+PL/////////////////////////////4ML//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//rFj//+XM/////////v3//+rW///Qof//uXL//6pW//+qVf//qlb//6pV//+qVf//qlX//6pV//+qVf//rVz//8iR///w4f/////////////////////////////48v//vn3//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7dw///w4f/////////////9+v//9uz//+nU///UqP//wob//7ly//+1a///t2///8GC///TqP//7dv///r1//////////////////////////////79///Zs///rVv//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//++ff//79////79/////////////////////////////////////////////////////////////////////////////////////////fv//+XL//+xYv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//tWv//9au///z6P////7////////////////////////////////////////////////////////////////////////16///1ar//69g//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6xZ//+2bv//06b///Xs////////////////////////////////////////////////////////+vb//9q2//+5dP//rFn//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6xZ///Agf//16///+fQ///w4f//8uT///Lk///v4P//58///9my///Eif//rl3//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+rV///rVv//61a//+qVv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6lV//eqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qVX/96pV/8aqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/xqlT/1yqVP/4qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf/3qVP/XKpV/w+pVP+VqlX/96pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pU//ipVP+VqlX/DwAAAACqVf8PqVP/XKpV/8apVf/3qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+pVf/3qlX/xqlT/1yqVf8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

export default function AuthPage() {
  const { login } = useAuth();
  const [screen, setScreen] = useState('login');
  const [pendingEmail, setPendingEmail] = useState('');

  const goLogin = () => setScreen('login');

  // ── Dynamic SEO per auth screen ───────────────────────────────────────
  const seoMap = {
    login:          { title: 'Sign In',             description: 'Sign in to PaperlessBoss to generate appointment letters from Excel. Secure OTP-based authentication by CodeCrafters Inc.' },
    register:       { title: 'Create Account',      description: 'Create your free PaperlessBoss account to start generating compliant appointment letters instantly from Excel data.' },
    otp:            { title: 'Verify Email',         description: 'Verify your email address to activate your PaperlessBoss account.', noIndex: true },
    'reg-success':  { title: 'Registration Success', description: 'Your PaperlessBoss account is ready.', noIndex: true },
    forgot:         { title: 'Forgot Password',      description: 'Reset your PaperlessBoss password securely.', noIndex: true },
    'forgot-otp':   { title: 'Reset Password OTP',   description: 'Enter OTP to reset your PaperlessBoss password.', noIndex: true },
    'reset-success':{ title: 'Password Reset',       description: 'Your password has been reset successfully.', noIndex: true },
  };
  useSeo(seoMap[screen] || seoMap['login']);

  return (
    <div className={styles.page}>
      <div className={styles.bgShapes} aria-hidden>
        <div className={styles.shape1} />
        <div className={styles.shape2} />
        <div className={styles.shape3} />
      </div>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <img src={LOGO_SRC} alt="PaperlessBoss logo" className={styles.logoImg} />
          <div>
            <div className={styles.logoName}>PaperlessBoss</div>
            <div className={styles.logoSub}>CodeCrafters Inc</div>
          </div>
        </div>

        {screen === 'login'        && <LoginScreen onLogin={login} onRegister={() => setScreen('register')} onForgot={() => setScreen('forgot')} />}
        {screen === 'register'     && <RegisterScreen onBack={goLogin} onRegistered={(e) => { setPendingEmail(e); setScreen('otp'); }} />}
        {screen === 'otp'          && <OtpScreen email={pendingEmail} onVerified={() => setScreen('reg-success')} onBack={() => setScreen('register')} />}
        {screen === 'reg-success'  && <RegSuccess onLogin={goLogin} />}
        {screen === 'forgot'       && <ForgotScreen onBack={goLogin} onOtpSent={(e) => { setPendingEmail(e); setScreen('forgot-otp'); }} />}
        {screen === 'forgot-otp'   && <ForgotOtpScreen email={pendingEmail} onSuccess={() => setScreen('reset-success')} onBack={() => setScreen('forgot')} />}
        {screen === 'reset-success'&& <ResetSuccess onLogin={goLogin} />}
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onRegister, onForgot }) {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try { await onLogin(email, password); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [email, password, onLogin]);

  return (
    <>
      <h2 className={styles.title}>Welcome back</h2>
      <p className={styles.subtitle}>Sign in to generate appointment letters</p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field label="Email address" icon={<Mail size={15} />}>
          <input type="email" placeholder="you@example.com" value={email} autoComplete="email"
            onChange={(e) => setEmail(e.target.value)} className={styles.input} disabled={loading} />
        </Field>
        <Field label="Password" icon={<Lock size={15} />} action={
          <button type="button" className={styles.fieldAction} onClick={onForgot}>Forgot password?</button>
        }>
          <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)} className={`${styles.input} ${styles.inputPw}`}
            autoComplete="current-password" disabled={loading} />
          <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => !p)} tabIndex={-1}>
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </Field>
        {error && <ErrorMsg msg={error} />}
        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? <Spinner /> : 'Sign In'}
        </button>
      </form>
      <p className={styles.switchText}>
        No account yet?{' '}
        <button type="button" className={styles.link} onClick={onRegister}>Create one free</button>
      </p>
    </>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────
function RegisterScreen({ onBack, onRegistered }) {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirm) { setError('Please fill in all fields.'); return; }
    if (password !== confirm)            { setError('Passwords do not match.'); return; }
    if (password.length < 8)            { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try { await authApi.register(email, password); onRegistered(email); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [email, password, confirm, onRegistered]);

  return (
    <>
      <BackBtn onClick={onBack} />
      <h2 className={styles.title}>Create account</h2>
      <p className={styles.subtitle}>Register to start generating appointment letters</p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field label="Email address" icon={<Mail size={15} />}>
          <input type="email" placeholder="you@example.com" value={email} autoComplete="email"
            onChange={(e) => setEmail(e.target.value)} className={styles.input} disabled={loading} />
        </Field>
        <Field label="Password" icon={<Lock size={15} />}>
          <input type={showPw ? 'text' : 'password'} placeholder="Minimum 8 characters" value={password}
            onChange={(e) => setPassword(e.target.value)} className={`${styles.input} ${styles.inputPw}`}
            autoComplete="new-password" disabled={loading} />
          <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => !p)} tabIndex={-1}>
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </Field>
        <Field label="Confirm password" icon={<Lock size={15} />}>
          <input type={showPw ? 'text' : 'password'} placeholder="Re-enter password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} className={styles.input}
            autoComplete="new-password" disabled={loading} />
        </Field>
        {error && <ErrorMsg msg={error} />}
        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? <Spinner /> : 'Create Account'}
        </button>
      </form>
      <p className={styles.switchText}>
        Already have an account?{' '}
        <button type="button" className={styles.link} onClick={onBack}>Sign in</button>
      </p>
    </>
  );
}

// ─── OTP Verify (registration) ────────────────────────────────────────────────
function OtpScreen({ email, onVerified, onBack }) {
  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]       = useState('');
  const [resent, setResent]     = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit code sent to your email.'); return; }
    setLoading(true);
    try { await authApi.verifyOtp(email, otp); onVerified(); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [email, otp, onVerified]);

  const handleResend = useCallback(async () => {
    setResending(true); setError(''); setResent(false);
    try { await authApi.resendOtp(email); setResent(true); }
    catch (err) { setError(err.message); }
    finally { setResending(false); }
  }, [email]);

  return (
    <>
      <BackBtn onClick={onBack} />
      <h2 className={styles.title}>Verify your email</h2>
      <p className={styles.subtitle}>
        We sent a 6-digit code to <strong>{email}</strong>. Enter it below to activate your account.
      </p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.otpWrap}>
          <input type="text" inputMode="numeric" maxLength={6} placeholder="000000"
            value={otp} className={styles.otpInput} autoFocus
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={loading} />
        </div>
        {error && <ErrorMsg msg={error} />}
        {resent && <div className={styles.successMsg}><CheckCircle size={14} /> New code sent to {email}</div>}
        <button type="submit" className={styles.primaryBtn} disabled={loading || otp.length < 6}>
          {loading ? <Spinner /> : 'Verify & Activate Account'}
        </button>
        <button type="button" className={styles.ghostBtn} onClick={handleResend} disabled={resending}>
          {resending ? <><Spinner small /> Resending…</> : <><RefreshCw size={13} /> Resend code</>}
        </button>
      </form>
    </>
  );
}

// ─── Registration Success ─────────────────────────────────────────────────────
function RegSuccess({ onLogin }) {
  return (
    <div className={styles.successScreen}>
      <div className={styles.successIconWrap}>
        <CheckCircle size={44} />
      </div>
      <h2 className={styles.successTitle}>You're all set! 🎉</h2>
      <p className={styles.successBody}>
        Your account has been <strong>verified and activated</strong> successfully.
        You can now sign in and start generating appointment letters.
      </p>
      <div className={styles.successHighlight}>
        <PartyPopper size={16} />
        <span>Welcome to PaperlessBoss!</span>
      </div>
      <button type="button" className={styles.primaryBtn} onClick={onLogin}>
        Sign In Now
      </button>
    </div>
  );
}

// ─── Forgot Password ───────────────────────────────────────────────────────────
function ForgotScreen({ onBack, onOtpSent }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try { await authApi.resendOtp(email); onOtpSent(email); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [email, onOtpSent]);

  return (
    <>
      <BackBtn onClick={onBack} />
      <h2 className={styles.title}>Reset password</h2>
      <p className={styles.subtitle}>Enter your email and we'll send a verification code.</p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field label="Email address" icon={<Mail size={15} />}>
          <input type="email" placeholder="you@example.com" value={email} autoComplete="email"
            onChange={(e) => setEmail(e.target.value)} className={styles.input} disabled={loading} autoFocus />
        </Field>
        {error && <ErrorMsg msg={error} />}
        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? <Spinner /> : 'Send Reset Code'}
        </button>
      </form>
      <p className={styles.switchText}>
        Remembered it?{' '}
        <button type="button" className={styles.link} onClick={onBack}>Sign in</button>
      </p>
    </>
  );
}

// ─── Forgot OTP ───────────────────────────────────────────────────────────────
function ForgotOtpScreen({ email, onSuccess, onBack }) {
  const [otp, setOtp]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Enter the 6-digit verification code.'); return; }
    setLoading(true);
    try { await authApi.verifyOtp(email, otp); onSuccess(); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [email, otp, onSuccess]);

  return (
    <>
      <BackBtn onClick={onBack} />
      <h2 className={styles.title}>Enter reset code</h2>
      <p className={styles.subtitle}>Enter the 6-digit code sent to <strong>{email}</strong></p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.otpWrap}>
          <input type="text" inputMode="numeric" maxLength={6} placeholder="000000"
            value={otp} className={styles.otpInput} autoFocus
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={loading} />
        </div>
        {error && <ErrorMsg msg={error} />}
        <button type="submit" className={styles.primaryBtn} disabled={loading || otp.length < 6}>
          {loading ? <Spinner /> : 'Confirm Identity'}
        </button>
      </form>
    </>
  );
}

// ─── Reset Success ─────────────────────────────────────────────────────────────
function ResetSuccess({ onLogin }) {
  return (
    <div className={styles.successScreen}>
      <div className={styles.successIconWrap}><CheckCircle size={44} /></div>
      <h2 className={styles.successTitle}>Identity verified</h2>
      <p className={styles.successBody}>
        Your account has been verified. Please contact your administrator to complete the password reset, or sign in if you remember your password.
      </p>
      <button type="button" className={styles.primaryBtn} onClick={onLogin}>Back to Sign In</button>
    </div>
  );
}

// ─── Shared sub-components ─────────────────────────────────────────────────────
function Field({ label, icon, action, children }) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldHeader}>
        <label className={styles.label}>{label}</label>
        {action}
      </div>
      <div className={styles.inputWrap}>
        <span className={styles.inputIcon}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button type="button" className={styles.backBtn} onClick={onClick}>
      <ArrowLeft size={14} /> Back
    </button>
  );
}

function ErrorMsg({ msg }) {
  return <div className={styles.errorMsg} role="alert">{msg}</div>;
}

function Spinner({ small }) {
  return <span className={small ? styles.spinnerSmall : styles.spinner} aria-hidden />;
}
