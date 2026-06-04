import React, { useState, useCallback } from 'react';
import { useSeo } from './hooks/useSeo';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { RefreshCw, LogOut, User } from 'lucide-react';

import UploadZone from './components/UploadZone';
import ValidationErrors from './components/ValidationErrors';
import DataPreview from './components/DataPreview';
import GeneratePanel from './components/GeneratePanel';
import LettersList from './components/LettersList';
import AuthPage from './components/AuthPage';

import { parseExcelFile, validateRows } from './utils/excelParser';
import { generateDocxBlob, sanitizeFilename } from './utils/docxGenerator';
import { generatePdfBlob } from './utils/pdfGenerator';
import { useAuth } from './context/AuthContext';
import { validateExcelApi } from './utils/authApi';
import { tokenStore } from './utils/authApi';

import styles from './App.module.css';

const LOGO_SRC = 'data:image/x-icon;base64,AAABAAMAEBAAAAEAIABoBAAANgAAACAgAAABACAAKBEAAJ4EAAAwMAAAAQAgAGgmAADGFQAAKAAAABAAAAAgAAAAAQAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKpV/36qVf/5qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/+apV/36qVf/5qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf/5qlX//6pV//+qVf//qlX//7hy//+5c///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///r1////////717//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//69f////////Eiv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//+LE////////yZP//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Ro////////9Gi//+4cv//yZT//8GD//+rV///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//u3j////////hw///zJn//+fO///+/v//7t7//7Fj//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pW///27f//8ub//6pV//+qVf//0aT////////jxv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//1q3///7+//+tW///qlX//7Vq/////////fz//6xa//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Bi///37///tGn//6pV//+2bf////////7+//+uXP//qlX//6pV//+qVf//qlX//6pV//+qVf//q1f//+vY///Tpv//wID//69g//+3cP//5s3////////n0P//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+0af//5Mn///79//////////////7+///ly///sWL//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+xY///v3///75+//+xZP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/+apV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/+apV/36qVf/5qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/+apV/34AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAACAAAABAAAAAAQAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAA/wKpVP98qlX/56pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/56lU/3yAAP8CqVT/fKpV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6lU/3yqVf/nqlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/56pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Vs///Ysf//06b//718//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//1Kn//////////////////8iQ//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///ZtP//////////////////2LL//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//9q0///////////////////du///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//1av//////////////////+HE//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Ll///////////////////5s3//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//758///////////////////q1v//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//rl3///79//////////////Di//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//79///////////////fr//6xY//+zaP//2rb//+jS///q1v//48f//86d//+vX///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///ZtP//////////////////unb//9Wr//////////////////////////////jy///Eif//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8GE///////////////////Mmv//qlX//7Fk///ChP//27f///37//////////////79///FjP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//rFn///r1/////////////969//+qVf//qlX//6pV//+qVf//wIH///38//////////////v2//+0af//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//4MH/////////////7t7//6pV//+qVf//qlX//6pV//+qVf//37///////////////////927//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Agf/////////////8+v//q1f//6pV//+qVf//qlX//6pV///Fi///////////////////+fP//6pW//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///w4f////////////+1bP//qlX//6pV//+qVf//qlX//7p1////////////////////////tGj//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8SJ/////////////717//+qVf//qlX//6pV//+qVf//uXT///////////////////////+2bf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//96+////////v3///6pV//+qVf//qlX//6pV///Klf///////////////////fz//61b//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//65e///69f//4sb//7l0//+qVf//q1f//8yZ//+xYv//qlX//6pV//+qVf//sWP///Pn///////////////////nz///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//9On//////////7//+nS///Nm///u3f//7Jl//+xZP//unX//9Ch///27f///////////////////fv//7p2//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//9Kl///9+/////////////////////////////////////////////////////////z4///Fi///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Zt///evf//+/j///////////////////////////////////38///ixv//tm7//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+tXP//woX//9Ci///Xr///1q7//9Ci///Dh///r2D//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf/nqlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/56lU/3yqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+pVP98gAD/AqlU/3yqVf/nqlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf/nqVT/fIAA/wIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAADAAAABgAAAAAQAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACqVf8PqVP/XKpV/8apVf/3qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+pVf/3qlX/xqlT/1yqVf8PAAAAAKpV/w+pVP+VqlT/+KpV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//epVP+VqlX/D6lT/1yqVf/3qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVP/4qVP/XKpV/8aqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/xqlV//eqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qVX/96pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+rWP//rVz//6tX//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Bi///gw///8uX///Dg///hw///wYP//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7hx///8+v///////////////////////8+g//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//759/////////////////////////////+/g//+rWP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8GE//////////////////////////////Ll//+vXv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8KE//////////////////////////////Pn//+xZP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//759//////////////////////////////Tq//+1av//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7hy///+/P////////////////////////Xs//+4cP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Zt///38P////////////////////////bu//+7d///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Nn///v4P////////////////////////fw//++fP//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7Bh///mzP////////////////////////jy///Bg///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6xZ///atv////////////////////////r0///Eiv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Onv///fv///////////////////z5///Mmf//qlX//6pV//+rV///tGr//717///Agf//wIH//7t3//+wYf//qlb//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV///Bg///+PL////////////////////+///Xrv//q1f//69g///cuf//9Oj///fv///48f//+PH///bu///y5P//3rz//7ly//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+zZ///8+f////////////////////////ixf//rl7//8CC///+/P////////////////////////////////////////v4///TqP//sGH//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVv//5Mv////////////////////////u3f//s2b//7Jm///Spf//3r7//+nT///27v///v7////////////////////////9+///4cP//7Jl//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//ypX////////////////////////69f//t27//6pV//+rVv//rVz//7Fj//+2bf//zp3///n0/////////////////////////v7//+XL//+vX///qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//sGH///z5////////////////////////xIn//6pV//+qVf//qlX//6pV//+qVf//qlX//7p1///y5f////////////////////////36///RpP//q1j//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//+PI////////////////////////1q7//6pV//+qVf//qlX//6pV//+qVf//qlX//6tX///Klf//+/b////////////////////////y5f//tm3//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8OI/////v//////////////////6NL//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+vYP//8eP////////////////////////+/v//0aT//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7No///w4f//////////////////+PH//6pW//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//3Ln/////////////////////////////8OH//6pW//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6xa///Zsv///v3//////////////////7Nn//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//zJj//////////////////////////////v3//7Fk//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+/gP//+PH//////////////////8CB//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//w4f//////////////////////////////////716//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+rV///4cT//////////////////8mS//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//woX//////////////////////////////////79///+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//tWz///Lm/////////////82b//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//zJr//////////////////////////////////7hy//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//8CB///38P///////8ya//+qVf//qlX//6pV//+qVf//qlX//6pV//+rV///5s3/////////////////////////////+/f//6xZ//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//tGn///r2///s2f//xoz//7Fk//+rV///qlX//6pW///BhP//69f//716//+qVf//qlX//6pV//+qVf//qlX//6tX///DiP//+PL/////////////////////////////4ML//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//rFj//+XM/////////v3//+rW///Qof//uXL//6pW//+qVf//qlb//6pV//+qVf//qlX//6pV//+qVf//rVz//8iR///w4f/////////////////////////////48v//vn3//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//7dw///w4f/////////////9+v//9uz//+nU///UqP//wob//7ly//+1a///t2///8GC///TqP//7dv///r1//////////////////////////////79///Zs///rVv//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//++ff//79////79/////////////////////////////////////////////////////////////////////////////////////////fv//+XL//+xYv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//tWv//9au///z6P////7////////////////////////////////////////////////////////////////////////16///1ar//69g//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6xZ//+2bv//06b///Xs////////////////////////////////////////////////////////+vb//9q2//+5dP//rFn//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6xZ///Agf//16///+fQ///w4f//8uT///Lk///v4P//58///9my///Eif//rl3//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+rV///rVv//61a//+qVv//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6lV//eqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qVX/96pV/8aqVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX/xqlT/1yqVP/4qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf/3qVP/XKpV/w+pVP+VqlX/96pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pU//ipVP+VqlX/DwAAAACqVf8PqVP/XKpV/8apVf/3qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+qVf//qlX//6pV//+pVf/3qlX/xqlT/1yqVf8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d3b6e, #185FA5)'
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(255,255,255,0.3)',
          borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <AuthPage />;
  return <MainApp />;
}

function MainApp() {
  const { user, logout } = useAuth();
  // App states:
  // 'idle'       → upload zone shown
  // 'validating' → calling /validate-excel API
  // 'invalid'    → API returned errors, show ValidationErrors panel
  // 'previewing' → validation passed, show data preview + generate panel
  // 'generating' → generating letters
  // 'done'       → letters ready for download
  const [state, setState]             = useState('idle');
  const [rows, setRows]               = useState([]);
  const [filename, setFilename]       = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [warnings, setWarnings]       = useState([]);
  const [parseError, setParseError]   = useState('');
  const [genProgress, setGenProgress] = useState(0);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [isZipping, setIsZipping]     = useState(false);
  const [format, setFormat]           = useState('both');
  const [validationResult, setValidationResult] = useState(null);

  // ── SEO: authenticated main app ─────────────────────────────────────
  useSeo({
    title: 'Appointment Letter Generator',
    description: 'Generate compliant appointment letters from Excel data as DOCX and PDF on your company letterhead. Built for HR teams by CodeCrafters Inc.',
    noIndex: false,
  });

  const handleFile = useCallback(async (file) => {
    setParseError('');
    setRows([]);
    setGeneratedFiles([]);
    setValidationResult(null);
    setFilename(file.name);
    setCurrentFile(file);
    setState('validating');

    try {
      // Step 1: Server-side validation via /validate-excel API
      const token = tokenStore.get();
      const result = await validateExcelApi(file, token);
      setValidationResult(result);

      if (!result.success) {
        // Has validation errors — show error panel, block generation
        setState('invalid');
        return;
      }

      // Step 2: Validation passed — parse locally for preview
      const { rows: parsed } = await parseExcelFile(file);
      const warns = validateRows(parsed);
      setRows(parsed);
      setWarnings(warns);
      setState('previewing');
    } catch (err) {
      setParseError(err.message || 'Validation failed. Please try again.');
      setState('idle');
    }
  }, []);

  const handleReupload = useCallback(() => {
    setState('idle');
    setRows([]);
    setCurrentFile(null);
    setFilename('');
    setValidationResult(null);
    setParseError('');
    setGeneratedFiles([]);
  }, []);

  const handleGenerate = useCallback(async () => {
    setState('generating');
    setGenProgress(0);
    const files = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const safeName = sanitizeFilename(row.employeeName);
      const entry = {
        name: row.employeeName || `Employee ${i + 1}`,
        designation: row.designation || '',
        dateOfJoining: row.dateOfJoining || '',
        safeName,
        docxBlob: null,
        pdfBlob: null,
        docxFilename: `Appointment_${safeName}.docx`,
        pdfFilename: `Appointment_${safeName}.pdf`,
      };

      if (format === 'docx' || format === 'both') entry.docxBlob = await generateDocxBlob(row);
      if (format === 'pdf'  || format === 'both') entry.pdfBlob  = await generatePdfBlob(row);

      files.push(entry);
      setGenProgress(i + 1);
      await new Promise(r => setTimeout(r, 0));
    }

    setGeneratedFiles(files);
    setState('done');
  }, [rows, format]);

  const handleDownloadOne = useCallback((index, type) => {
    const f = generatedFiles[index];
    if (type === 'docx' && f.docxBlob) saveAs(f.docxBlob, f.docxFilename);
    if (type === 'pdf'  && f.pdfBlob)  saveAs(f.pdfBlob,  f.pdfFilename);
  }, [generatedFiles]);

  const handleDownloadAll = useCallback(async (type) => {
    setIsZipping(true);
    const zip = new JSZip();
    const folder = zip.folder('Appointment_Letters');
    generatedFiles.forEach(f => {
      if (type !== 'pdf'  && f.docxBlob) folder.file(f.docxFilename, f.docxBlob);
      if (type !== 'docx' && f.pdfBlob)  folder.file(f.pdfFilename,  f.pdfBlob);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    saveAs(zipBlob, `Appointment_Letters_${type === 'both' ? 'All' : type.toUpperCase()}.zip`);
    setIsZipping(false);
  }, [generatedFiles]);

  const handleReset = useCallback(() => {
    setState('idle');
    setRows([]); setFilename(''); setWarnings([]);
    setParseError(''); setGenProgress(0); setGeneratedFiles([]);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}><img src={LOGO_SRC} alt="PaperlessBoss" /></div>
            <span className={styles.brandName}>PaperlessBoss</span>
            <span className={styles.brandSub}>CodeCrafters Inc</span>
          </div>
          <div className={styles.navRight}>
            {state !== 'idle' && (
              <button className={styles.resetBtn} onClick={handleReset} aria-label="Start over">
                <RefreshCw size={14} /> Start Over
              </button>
            )}
            <div className={styles.userChip}>
              <User size={13} />
              <span className={styles.userEmail}>{user?.email || 'User'}</span>
            </div>
            <button className={styles.logoutBtn} onClick={logout} title="Sign out">
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <StepIndicator current={state} />

          {/* Upload zone — shown when idle */}
          {(state === 'idle' || state === 'validating') && (
            <UploadZone
              onFileParsed={handleFile}
              isParsing={state === 'validating'}
              isValidating={state === 'validating'}
              error={parseError}
            />
          )}

          {/* Validation failed — show errors, block generation */}
          {state === 'invalid' && validationResult && (
            <ValidationErrors
              result={validationResult}
              filename={filename}
              onReupload={handleReupload}
            />
          )}

          {/* Validation passed — show preview + generate panel */}
          {(state === 'previewing' || state === 'generating') && (
            <>
              <DataPreview rows={rows} filename={filename} warnings={warnings} />
              <GeneratePanel
                total={rows.length} progress={genProgress}
                isGenerating={state === 'generating'}
                format={format} onFormatChange={setFormat} onGenerate={handleGenerate}
                validationPassed={true}
              />
            </>
          )}

          {/* Letters generated — download panel */}
          {state === 'done' && (
            <>
              <DataPreview rows={rows} filename={filename} warnings={warnings} />
              <LettersList
                files={generatedFiles} format={format}
                onDownloadOne={handleDownloadOne} onDownloadAll={handleDownloadAll}
                isZipping={isZipping}
              />
            </>
          )}

          {state === 'idle' && <HelpCard />}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© PaperlessBoss · NLC India Renewables Limited &nbsp;|&nbsp; Code on Wages, 2019 &amp; Code on Social Security, 2020</p>
      </footer>
    </div>
  );
}

const STEPS = ['Upload', 'Validate', 'Preview', 'Generate', 'Download'];
const STATE_ORDER = { idle: 0, validating: 1, invalid: 1, previewing: 2, generating: 3, done: 4 };

function StepIndicator({ current }) {
  const ci = STATE_ORDER[current] ?? 0;
  return (
    <div className={styles.steps}>
      {STEPS.map((label, i) => {
        const done = i < ci, active = i === ci;
        return (
          <React.Fragment key={label}>
            <div className={`${styles.step} ${active ? styles.stepActive : ''} ${done ? styles.stepDone : ''}`}>
              <div className={styles.stepCircle}>{done ? '✓' : i + 1}</div>
              <span className={styles.stepLabel}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function HelpCard() {
  return (
    <div className={styles.helpCard}>
      <h3 className={styles.helpTitle}>How it works</h3>
      <ol className={styles.helpList}>
        <li><strong>Prepare your Excel file</strong> — Use the provided template with all required employee columns.</li>
        <li><strong>Upload the file</strong> — Drag &amp; drop or click to browse. Preview data before generating.</li>
        <li><strong>Choose format</strong> — Generate as DOCX, PDF, or both — all on the Company's or Vendor's letterhead.</li>
        <li><strong>Download</strong> — Individual files or all together as a .zip archive.</li>
      </ol>
      <div className={styles.helpColumns}>
        <div>
          <p className={styles.helpColTitle}>Required Excel columns</p>
          <ul className={styles.helpColList}>
            <li>Name of employee</li><li>Date of birth</li>
            <li>Father's / Mother's name</li><li>Aadhaar number</li>
            <li>Labour Identification Number (LIN)</li><li>Universal Account Number (UAN) / ESIC</li>
            <li>Designation</li><li>Type of Employment</li>
          </ul>
        </div>
        <div>
          <p className={styles.helpColTitle}>&nbsp;</p>
          <ul className={styles.helpColList}>
            <li>Category of Skill</li><li>Date of Joining</li>
            <li>Basic Pay</li><li>Dearness Allowance</li>
            <li>Other Allowance</li><li>Applicability of social security benefits</li>
            <li>Broad nature of duties performed</li><li>Maternity Benefit / Any other info</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
