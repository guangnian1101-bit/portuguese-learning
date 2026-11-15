#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为词库所有动词生成变位数据，输出为JS文件
不规则动词用手动维护的表覆盖
时态：现在式、过去式、过去未完成式、将来式、虚拟式现在、条件式
"""
import json, glob, os

DATA_DIR = r"C:\Users\joaow\Desktop\葡语！\v2\data"

# ============================================================
# 不规则动词变位表（手动维护）
# 时态顺序：presente, perfeito, imperfeito, futuro, conjuntivo_presente, condicional
# ============================================================
IRREGULAR = {
  # --- 完全不规则 ---
  'ser': {
    'presente':['sou','és','é','somos','sois','são'],
    'perfeito':['fui','foste','foi','fomos','fostes','foram'],
    'imperfeito':['era','eras','era','éramos','éreis','eram'],
    'futuro':['serei','serás','será','seremos','sereis','serão'],
    'conj_presente':['seja','sejas','seja','sejamos','sejais','sejam'],
    'condicional':['seria','serias','seria','seríamos','seríeis','seriam'],
  },
  'estar': {
    'presente':['estou','estás','está','estamos','estais','estão'],
    'perfeito':['estive','estiveste','esteve','estivemos','estivestes','estiveram'],
    'imperfeito':['estava','estavas','estava','estávamos','estáveis','estavam'],
    'futuro':['estarei','estarás','estará','estaremos','estareis','estarão'],
    'conj_presente':['esteja','estejas','esteja','estejamos','estejais','estejam'],
    'condicional':['estaria','estarias','estaria','estaríamos','estaríeis','estariam'],
  },
  'ter': {
    'presente':['tenho','tens','tem','temos','tendes','têm'],
    'perfeito':['tive','tiveste','teve','tivemos','tivestes','tiveram'],
    'imperfeito':['tinha','tinhas','tinha','tínhamos','tínheis','tinham'],
    'futuro':['terei','terás','terá','teremos','tereis','terão'],
    'conj_presente':['tenha','tenhas','tenha','tenhamos','tenhais','tenham'],
    'condicional':['teria','terias','teria','teríamos','teríeis','teriam'],
  },
  'ir': {
    'presente':['vou','vais','vai','vamos','ides','vão'],
    'perfeito':['fui','foste','foi','fomos','fostes','foram'],
    'imperfeito':['ia','ias','ia','íamos','íeis','iam'],
    'futuro':['irei','irás','irá','iremos','ireis','irão'],
    'conj_presente':['vá','vás','vá','vamos','vades','vão'],
    'condicional':['iria','irias','iria','iríamos','iríeis','iriam'],
  },
  'fazer': {
    'presente':['faço','fazes','faz','fazemos','fazeis','fazem'],
    'perfeito':['fiz','fizeste','fez','fizemos','fizestes','fizeram'],
    'imperfeito':['fazia','fazias','fazia','fazíamos','fazíeis','faziam'],
    'futuro':['farei','farás','fará','faremos','fareis','farão'],
    'conj_presente':['faça','faças','faça','façamos','façais','façam'],
    'condicional':['faria','farias','faria','faríamos','faríeis','fariam'],
  },
  # --- eu人称-go结尾 + 语音变化 ---
  'dizer': {
    'presente':['digo','dizes','diz','dizemos','dizeis','dizem'],
    'perfeito':['disse','disseste','disse','dissemos','dissestes','disseram'],
    'imperfeito':['dizia','dizias','dizia','dizíamos','dizíeis','diziam'],
    'futuro':['direi','dirás','dirá','diremos','direis','dirão'],
    'conj_presente':['diga','digas','diga','digamos','digais','digam'],
    'condicional':['diria','dirias','diria','diríamos','diríeis','diriam'],
  },
  'trazer': {
    'presente':['trago','trazes','traz','trazemos','trazéis','trazem'],
    'perfeito':['trouxe','trouxeste','trouxe','trouxemos','trouxestes','trouxeram'],
    'imperfeito':['trazia','trazias','trazia','trazíamos','trazíeis','traziam'],
    'futuro':['trarei','trarás','trará','traremos','trareis','trarão'],
    'conj_presente':['traga','tragas','traga','tragamos','tragais','tragam'],
    'condicional':['traria','trarias','traria','traríamos','traríeis','trariam'],
  },
  'poder': {
    'presente':['posso','podes','pode','podemos','podeis','podem'],
    'perfeito':['pude','pudeste','pôde','pudemos','pudestes','puderam'],
    'imperfeito':['podia','podias','podia','podíamos','podíeis','podiam'],
    'futuro':['poderei','poderás','poderá','poderemos','podereis','poderão'],
    'conj_presente':['possa','possas','possa','possamos','possais','possam'],
    'condicional':['poderia','poderias','poderia','poderíamos','poderíeis','poderiam'],
  },
  'querer': {
    'presente':['quero','queres','quer','queremos','quereis','querem'],
    'perfeito':['quis','quiseste','quis','quisemos','quisestes','quiseram'],
    'imperfeito':['queria','querias','queria','queríamos','queríeis','queriam'],
    'futuro':['quererei','quererás','quererá','quereremos','querereis','quererão'],
    'conj_presente':['queira','queiras','queira','queiramos','queirais','queiram'],
    'condicional':['quereria','quererias','quereria','quereríamos','quereríeis','quereriam'],
  },
  'saber': {
    'presente':['sei','sabes','sabe','sabemos','sabeis','sabem'],
    'perfeito':['soube','soubeste','soube','soubemos','soubestes','souberam'],
    'imperfeito':['sabia','sabias','sabia','sabíamos','sabíeis','sabiam'],
    'futuro':['saberei','saberás','saberá','saberemos','sabereis','saberão'],
    'conj_presente':['saiba','saibas','saiba','saibamos','saibais','saibam'],
    'condicional':['saberia','saberias','saberia','saberíamos','saberíeis','saberiam'],
  },
  'haver': {
    'presente':['hei','hás','há','havemos','haveis','hão'],
    'perfeito':['houve','houveste','houve','houvemos','houvestes','houveram'],
    'imperfeito':['havia','havias','havia','havíamos','hávíeis','haviam'],
    'futuro':['haverá','haverás','haverá','haveremos','havereis','haverão'],
    'conj_presente':['haja','hajas','haja','hajamos','hajais','hajam'],
    'condicional':['haveria','haverias','haveria','haveríamos','haveríeis','haveriam'],
  },
  'ver': {
    'presente':['vejo','vês','vê','vemos','vedeis','veem'],
    'perfeito':['vi','viste','viu','vimos','vistes','viram'],
    'imperfeito':['via','vias','via','víamos','víeis','viam'],
    'futuro':['verei','verás','verá','veremos','vereis','verão'],
    'conj_presente':['veja','vejas','veja','vejamos','vejais','vejam'],
    'condicional':['veria','verias','veria','veríamos','veríeis','veriam'],
  },
  'vir': {
    'presente':['venho','vens','vem','vimos','vindeis','vêm'],
    'perfeito':['vim','vieste','veio','viemos','viestes','vieram'],
    'imperfeito':['vinha','vinhas','vinha','vínhamos','vínhieis','vinham'],
    'futuro':['virei','virás','virá','viremos','vireis','virão'],
    'conj_presente':['venha','venhas','venha','venhamos','venhais','venham'],
    'condicional':['viria','virias','viria','viríamos','viríeis','viriam'],
  },
  'sair': {
    'presente':['saio','sais','sai','saímos','saís','saem'],
    'perfeito':['saí','saíste','saiu','saímos','saístes','saíram'],
    'imperfeito':['saía','saías','saía','saíamos','saíeis','saíam'],
    'futuro':['sairei','sairás','sairá','sairemos','sairás','sairão'],
    'conj_presente':['saia','saias','saia','saiamos','saiais','saiam'],
    'condicional':['sairia','sairias','sairia','sairíamos','sairíeis','sairiam'],
  },
  'dar': {
    'presente':['dou','dás','dá','damos','dais','dão'],
    'perfeito':['dei','deste','deu','demos','destes','deram'],
    'imperfeito':['dava','davas','dava','dávamos','dáveis','davam'],
    'futuro':['darei','darás','dará','daremos','dareis','darão'],
    'conj_presente':['dê','dês','dê','dêamos','dêeis','dêem'],
    'condicional':['daria','darias','daria','daríamos','daríeis','dariam'],
  },
  # --- 常见半不规则（语音变化） ---
  'pedir': {
    'presente':['peço','pedes','pede','pedimos','pedis','pedem'],
    'perfeito':['pedi','pediste','pediu','pedimos','pedistes','pediram'],
    'imperfeito':['pedia','pedias','pedia','pedíamos','pedíeis','pediam'],
    'futuro':['pedirei','pedirás','pedirá','pediremos','pedireis','pedirão'],
    'conj_presente':['peça','peças','peça','peçamos','peçais','peçam'],
    'condicional':['pediria','pedirias','pediria','pediríamos','pediríeis','pediriam'],
  },
  'dormir': {
    'presente':['durmo','dormes','dorme','dormimos','dormis','dormem'],
    'perfeito':['dormi','dormiste','dormiu','dormimos','dormistes','dormiram'],
    'imperfeito':['dormia','dormias','dormia','dormíamos','dormíeis','dormiam'],
    'futuro':['dormirei','dormirás','dormirá','dormiremos','dormireis','dormirão'],
    'conj_presente':['durma','durmas','durma','durmamos','durmais','durmam'],
    'condicional':['dormiria','dormirias','dormiria','dormiríamos','dormiríeis','dormiriam'],
  },
  'sentir': {
    'presente':['sinto','sentes','sente','sentimos','sentis','sentem'],
    'perfeito':['senti','sentiste','sentiu','sentimos','sentistes','sentiram'],
    'imperfeito':['sentia','sentias','sentia','sentíamos','sentíeis','sentiam'],
    'futuro':['sentirei','sentirás','sentirá','sentiremos','sentireis','sentirão'],
    'conj_presente':['sinta','sintas','sinta','sintamos','sintais','sintam'],
    'condicional':['sentiria','sentirias','sentiria','sentiríamos','sentiríeis','sentiriam'],
  },
  'servir': {
    'presente':['sirvo','serves','serve','servimos','servis','servem'],
    'perfeito':['servi','serviste','serviu','servimos','servistes','serviram'],
    'imperfeito':['servia','servias','servia','servíamos','servíeis','serviam'],
    'futuro':['servirei','servirás','servirá','serviremos','servireis','servirão'],
    'conj_presente':['sirva','sirvas','sirva','sirvamos','sirvais','sirvam'],
    'condicional':['serviria','servirias','serviria','serviríamos','serviríeis','serviriam'],
  },
  'conseguir': {
    'presente':['consigo','consigas','consigue','conseguimos','conseguis','conseguem'],
    'perfeito':['consegui','conseguiste','conseguiu','conseguimos','conseguistes','conseguiram'],
    'imperfeito':['conseguia','conseguias','conseguia','conseguíamos','conseguíeis','conseguiam'],
    'futuro':['conseguirei','conseguirás','conseguirá','conseguiremos','conseguireis','conseguirão'],
    'conj_presente':['consiga','consigas','consiga','consigamos','consigais','consigam'],
    'condicional':['conseguiria','conseguirias','conseguiria','conseguiríamos','conseguiríeis','conseguiriam'],
  },
  'ouvir': {
    'presente':['ouço','ouves','ouve','ouvimos','ouvís','ouvem'],
    'perfeito':['ouvi','ouviste','ouviu','ouvimos','ouvistes','ouviram'],
    'imperfeito':['ouvia','ouvias','ouvia','ouvíamos','ouvíeis','ouviam'],
    'futuro':['ouvirei','ouvirás','ouvirá','ouviremos','ouvireis','ouvirão'],
    'conj_presente':['ouça','ouças','ouça','ouçamos','ouçais','ouçam'],
    'condicional':['ouviria','ouvirias','ouviria','ouviríamos','ouviríeis','ouviriam'],
  },
  'conhecer': {
    'presente':['conheço','conheces','conhece','conhecemos','conheceis','conhecem'],
    'perfeito':['conheci','conheceste','conheceu','conhecemos','conhecestes','conheceram'],
    'imperfeito':['conhecia','conhecias','conhecia','conhecíamos','conhecíeis','conheciam'],
    'futuro':['conhecerei','conhecerás','conhecerá','conheceremos','conhecereis','conhecerão'],
    'conj_presente':['conheça','conheças','conheça','conheçamos','conheçais','conheçam'],
    'condicional':['conheceria','conhecerias','conheceria','conheceríamos','conheceríeis','conheceriam'],
  },
  'parecer': {
    'presente':['pareço','pareces','parece','parecemos','pareceis','parecem'],
    'perfeito':['pareci','pareceste','pareceu','parecemos','parecestes','pareceram'],
    'imperfeito':['parecia','parecias','parecia','parecíamos','parecíeis','pareciam'],
    'futuro':['parecerei','parecerás','parecerá','pareceremos','parecereis','parecerão'],
    'conj_presente':['pareça','pareças','pareça','pareçamos','pareçais','pareçam'],
    'condicional':['pareceria','parecerias','pareceria','pareceríamos','pareceríeis','pareceriam'],
  },
  'escrever': {
    'presente':['escrevo','escreves','escreve','escrevemos','escreveis','escrevem'],
    'perfeito':['escrevi','escreveste','escreveu','escrevemos','escrevestes','escreveram'],
    'imperfeito':['escrevia','escrevias','escrevia','escrevíamos','escrevíeis','escreviam'],
    'futuro':['escreverei','escreverás','escreverá','escreveremos','escrevereis','escreverão'],
    'conj_presente':['escreva','escrevas','escreva','escrevamos','escrevais','escrevam'],
    'condicional':['escreveria','escreverias','escreveria','escreveríamos','escreveríeis','escreveriam'],
  },
  'ler': {
    'presente':['leio','lês','lê','lemos','leis','leem'],
    'perfeito':['li','leste','leu','lemos','lestes','leram'],
    'imperfeito':['lia','lias','lia','líamos','líeis','liam'],
    'futuro':['lerei','lerás','lerá','leremos','lereis','lerão'],
    'conj_presente':['leia','leias','leia','leiamos','leiais','leiam'],
    'condicional':['leria','lerias','leria','leríamos','leríeis','leriam'],
  },
  'abrir': {
    'presente':['abro','abres','abre','abrimos','abris','abrem'],
    'perfeito':['abri','abriste','abriu','abrimos','abristes','abriram'],
    'imperfeito':['abria','abrias','abria','abríamos','abríeis','abriam'],
    'futuro':['abrirei','abrirás','abrirá','abriremos','abrireis','abrirão'],
    'conj_presente':['abra','abras','abra','abramos','abrais','abram'],
    'condicional':['abriria','abririas','abriria','abriríamos','abriríeis','abririam'],
  },
  'seguir': {
    'presente':['sigo','segues','segue','seguimos','seguiis','seguem'],
    'perfeito':['segui','seguiste','seguiu','seguimos','seguistes','seguiram'],
    'imperfeito':['seguia','seguías','seguia','seguíamos','seguíeis','seguiam'],
    'futuro':['seguirei','seguirás','seguirá','seguiremos','seguireis','seguirão'],
    'conj_presente':['siga','sigas','siga','sigamos','sigais','sigam'],
    'condicional':['seguiria','seguirias','seguiria','seguiríamos','seguiríeis','seguiriam'],
  },
  'repetir': {
    'presente':['repito','repetes','repete','repetimos','repetis','repetem'],
    'perfeito':['repeti','repetiste','repetiu','repetimos','repetistes','repetiram'],
    'imperfeito':['repetia','repetias','repetia','repetíamos','repetíeis','repetiam'],
    'futuro':['repetirei','repetirás','repetirá','repetiremos','repetireis','repetirão'],
    'conj_presente':['repita','repitas','repita','repitamos','repitais','repitam'],
    'condicional':['repetiria','repetirias','repetiria','repetiríamos','repetiríeis','repetiriam'],
  },
  'começar': {
    'presente':['começo','começas','começa','começamos','começais','começam'],
    'perfeito':['comecei','começaste','começou','começámos','começastes','começaram'],
    'imperfeito':['começava','começavas','começava','começávamos','começáveis','começavam'],
    'futuro':['começarei','começarás','começará','começaremos','começareis','começarão'],
    'conj_presente':['comece','comeces','comece','comecemos','comeceis','comecem'],
    'condicional':['começaria','começarias','começaria','começaríamos','começaríeis','começariam'],
  },
  'pagar': {
    'presente':['pago','pagas','paga','pagamos','pagais','pagam'],
    'perfeito':['paguei','pagaste','pagou','pagámos','pagastes','pagaram'],
    'imperfeito':['pagava','pagavas','pagava','pagávamos','pagáveis','pagavam'],
    'futuro':['pagarei','pagarás','pagará','pagaremos','pagareis','pagarão'],
    'conj_presente':['pague','pagues','pague','paguemos','pagueis','paguem'],
    'condicional':['pagaria','pagarias','pagaria','pagaríamos','pagaríeis','pagariam'],
  },
  'perder': {
    'presente':['perco','perdes','perde','perdemos','perdeis','perdem'],
    'perfeito':['perdi','perdeste','perdeu','perdemos','perdestes','perderam'],
    'imperfeito':['perdia','perdias','perdia','perdíamos','perdíeis','perdiam'],
    'futuro':['perderei','perderás','perderá','perderemos','perdereis','perderão'],
    'conj_presente':['perca','percas','perca','percamos','percais','percam'],
    'condicional':['perderia','perderias','perderia','perderíamos','perderíeis','perderiam'],
  },
  'morrer': {
    'presente':['morro','morres','morre','morremos','morreis','morrem'],
    'perfeito':['morri','morreste','morreu','morremos','morrestes','morreram'],
    'imperfeito':['morria','morrias','morria','morríamos','morríeis','morriam'],
    'futuro':['morrerei','morrerás','morrerá','morreremos','morrereis','morrerão'],
    'conj_presente':['morra','morras','morra','morrermos','morrais','morram'],
    'condicional':['morreria','morrarias','morreria','morreríamos','morreríeis','morreriam'],
  },
  'contar': {
    'presente':['conto','contas','conta','contamos','contais','contam'],
    'perfeito':['contei','contaste','contou','contámos','contastes','contaram'],
    'imperfeito':['contava','contavas','contava','contávamos','contáveis','contavam'],
    'futuro':['contarei','contarás','contará','contaremos','contareis','contarão'],
    'conj_presente':['conte','contes','conte','contemos','conteeis','contem'],
    'condicional':['contaria','contarias','contaria','contaríamos','contaríeis','contariam'],
  },
  'jogar': {
    'presente':['jogo','jogas','joga','jogamos','jogais','jogam'],
    'perfeito':['joguei','jogaste','jogou','jogámos','jogastes','jogaram'],
    'imperfeito':['jogava','jogavas','jogava','jogávamos','jogáveis','jogavam'],
    'futuro':['jogarei','jogarás','jogará','jogaremos','jogareis','jogarão'],
    'conj_presente':['jogue','jogues','jogue','joguemos','jogueis','joguem'],
    'condicional':['jogaria','jogarias','jogaria','jogaríamos','jogaríeis','jogariam'],
  },
  'chegar': {
    'presente':['chego','chegas','chega','chegamos','chegais','chegam'],
    'perfeito':['cheguei','chegaste','chegou','chegámos','chegastes','chegaram'],
    'imperfeito':['chegava','chegavas','chegava','chegávamos','chegáveis','chegavam'],
    'futuro':['chegarei','chegarás','chegará','chegaremos','chegareis','chegarão'],
    'conj_presente':['chegue','chegues','chegue','cheguemos','chegueis','cheguem'],
    'condicional':['chegaria','chegarias','chegaria','chegaríamos','chegaríeis','chegariam'],
  },
  'ficar': {
    'presente':['fico','ficas','fica','ficamos','ficais','ficam'],
    'perfeito':['fiquei','ficaste','ficou','ficámos','ficastes','ficaram'],
    'imperfeito':['ficava','ficavas','ficava','ficávamos','ficáveis','ficavam'],
    'futuro':['ficarei','ficarás','ficará','ficaremos','ficareis','ficarão'],
    'conj_presente':['fique','fiques','fique','fiquemos','fiqueis','fiquem'],
    'condicional':['ficaria','ficarias','ficaria','ficaríamos','ficaríeis','ficariam'],
  },
  'levar': {
    'presente':['levo','levas','leva','levamos','levais','levam'],
    'perfeito':['levei','levaste','levou','levámos','levastes','levaram'],
    'imperfeito':['levava','levavas','levava','levávamos','leváveis','levavam'],
    'futuro':['levaréi','levarás','levará','levaremos','levareis','levarão'],
    'conj_presente':['leve','leves','leve','levemos','leveis','levem'],
    'condicional':['levaria','levarias','levaria','levaríamos','levaríeis','levaria'],
  },
  'passar': {
    'presente':['passo','passas','passa','passamos','passais','passam'],
    'perfeito':['passei','passaste','passou','passámos','passastes','passaram'],
    'imperfeito':['passava','passavas','passava','passávamos','passáveis','passavam'],
    'futuro':['passarei','passarás','passará','passaremos','passareis','passarão'],
    'conj_presente':['passe','passes','passe','passemos','passeis','passem'],
    'condicional':['passaria','passarias','passaria','passaríamos','passaríeis','passariam'],
  },
  'responder': {
    'presente':['respondo','respondes','responde','respondemos','respondesis','respondem'],
    'perfeito':['respondi','respondeste','respondeu','respondemos','respondestes','responderam'],
    'imperfeito':['respondia','respondias','respondia','respondíamos','respondíeis','respondiam'],
    'futuro':['responderei','responderás','responderá','responderemos','respondereis','responderão'],
    'conj_presente':['responda','respondas','responda','respondamos','respondais','respondam'],
    'condicional':['responderia','responderias','responderia','responderíamos','responderíeis','responderiam'],
  },
  'acreditar': {
    'presente':['acredito','acreditas','acredita','acreditamos','acreditais','acreditam'],
    'perfeito':['acreditei','acreditaste','acreditou','acreditámos','acreditastes','acreditaram'],
    'imperfeito':['acreditava','acreditavas','acreditava','acreditávamos','acreditáveis','acreditavam'],
    'futuro':['acreditarei','acreditarás','acreditará','acreditaremos','acreditareis','acreditarão'],
    'conj_presente':['acredite','acredites','acredite','acreditemos','acrediteis','acreditem'],
    'condicional':['acreditaria','acreditarias','acreditaria','acreditaríamos','acreditaríeis','acreditariam'],
  },
  'ganhar': {
    'presente':['ganho','ganhas','ganha','ganhamos','ganhais','ganham'],
    'perfeito':['ganhei','ganhaste','ganhou','ganhámos','ganhastes','ganharam'],
    'imperfeito':['ganhava','ganhavas','ganhava','ganhávamos','ganháveis','ganhavam'],
    'futuro':['ganharei','ganharás','ganhará','ganharemos','ganhareis','ganharão'],
    'conj_presente':['ganhe','ganhes','ganhe','ganhemos','ganheis','ganhem'],
    'condicional':['ganharia','ganharias','ganharia','ganharíamos','ganharíeis','ganhariam'],
  },
  'produzir': {
    'presente':['produzo','produzis','produz','produzimos','produzis','produzem'],
    'perfeito':['produzi','produzeste','produziu','produzimos','produzistes','produziram'],
    'imperfeito':['produzia','produzias','produzia','produzíamos','produzíeis','produziam'],
    'futuro':['produzirei','produzirás','produzirá','produziremos','produzireis','produzirão'],
    'conj_presente':['produza','produzas','produza','produzamos','produzais','produzam'],
    'condicional':['produziria','produzirias','produziria','produziríamos','produziríeis','produziriam'],
  },
  'oferecer': {
    'presente':['ofereço','ofereces','oferece','oferecemos','ofereceis','oferecem'],
    'perfeito':['ofereci','ofereceste','ofereceu','oferecemos','oferecestes','ofereceram'],
    'imperfeito':['oferecia','oferecias','oferecia','oferecíamos','oferecíeis','ofereciam'],
    'futuro':['oferecerei','oferecerás','oferecerá','ofereceremos','oferecereis','oferecerão'],
    'conj_presente':['ofereça','ofereças','ofereça','ofereçamos','ofereçais','ofereçam'],
    'condicional':['ofereceria','oferecerias','ofereceria','ofereceríamos','ofereceríeis','ofereceriam'],
  },
  'aparecer': {
    'presente':['apareço','apareces','aparece','aparecemos','apareceis','aparecem'],
    'perfeito':['apareci','apareceste','apareceu','aparecemos','aparecestes','apareceram'],
    'imperfeito':['aparecia','aparecias','aparecia','aparecíamos','aparecíeis','apareciam'],
    'futuro':['aparecerei','aparecerás','aparecerá','apareceremos','aparecereis','aparecerão'],
    'conj_presente':['apareça','apareças','apareça','apareçamos','apareçais','apareçam'],
    'condicional':['apareceria','aparecerias','apareceria','apareceríamos','apareceríeis','apareceriam'],
  },
}

def conjugate_regular(verb):
    """规则变位生成，包含全部6个时态"""
    if verb.endswith('ar'):
        stem = verb[:-2]
        return {
            'presente': [stem+'o', stem+'as', stem+'a', stem+'amos', stem+'ais', stem+'am'],
            'perfeito': [stem+'ei', stem+'aste', stem+'ou', stem+'ámos', stem+'astes', stem+'aram'],
            'imperfeito': [stem+'ava', stem+'avas', stem+'ava', stem+'ávamos', stem+'áveis', stem+'avam'],
            'futuro': [verb+'ei', verb+'ás', verb+'á', verb+'emos', verb+'eis', verb+'ão'],
            'conj_presente': [stem+'e', stem+'es', stem+'e', stem+'emos', stem+'eis', stem+'em'],
            'condicional': [verb+'ia', verb+'ias', verb+'ia', verb+'íamos', verb+'íeis', verb+'iam'],
        }
    elif verb.endswith('er'):
        stem = verb[:-2]
        return {
            'presente': [stem+'o', stem+'es', stem+'e', stem+'emos', stem+'eis', stem+'em'],
            'perfeito': [stem+'i', stem+'este', stem+'eu', stem+'emos', stem+'estes', stem+'eram'],
            'imperfeito': [stem+'ia', stem+'ias', stem+'ia', stem+'íamos', stem+'íeis', stem+'iam'],
            'futuro': [verb+'ei', verb+'ás', verb+'á', verb+'emos', verb+'eis', verb+'ão'],
            'conj_presente': [stem+'a', stem+'as', stem+'a', stem+'amos', stem+'ais', stem+'am'],
            'condicional': [verb+'ia', verb+'ias', verb+'ia', verb+'íamos', verb+'íeis', verb+'iam'],
        }
    elif verb.endswith('ir'):
        stem = verb[:-2]
        return {
            'presente': [stem+'o', stem+'es', stem+'e', stem+'imos', stem+'is', stem+'em'],
            'perfeito': [stem+'i', stem+'iste', stem+'iu', stem+'imos', stem+'istes', stem+'iram'],
            'imperfeito': [stem+'ia', stem+'ias', stem+'ia', stem+'íamos', stem+'íeis', stem+'iam'],
            'futuro': [verb+'ei', verb+'ás', verb+'á', verb+'emos', verb+'eis', verb+'ão'],
            'conj_presente': [stem+'a', stem+'as', stem+'a', stem+'amos', stem+'ais', stem+'am'],
            'condicional': [verb+'ia', verb+'ias', verb+'ia', verb+'íamos', verb+'íeis', verb+'iam'],
        }
    return None

# 加载词库
all_words = []
for fp in sorted(glob.glob(os.path.join(DATA_DIR, "dict-*.json"))):
    with open(fp, 'r', encoding='utf-8') as f:
        all_words.extend(json.load(f))

# 提取所有动词原形
verbs = {}
for w in all_words:
    if w.get('pos') != '动词':
        continue
    pt = w['pt']
    if not (pt.endswith('ar') or pt.endswith('er') or pt.endswith('ir')):
        continue
    verbs[pt] = w.get('cn', '')[:30]

print(f"词库动词数量: {len(verbs)}")
print(f"手动不规则动词: {len(IRREGULAR)}")

# 生成变位数据
TENSES_LIST = ['presente', 'perfeito', 'imperfeito', 'futuro', 'conj_presente', 'condicional']

all_conj = {}
irregular_count = 0
for v in verbs:
    if v in IRREGULAR:
        all_conj[v] = IRREGULAR[v]
        irregular_count += 1
    else:
        conj = conjugate_regular(v)
        if conj:
            all_conj[v] = conj

print(f"生成变位数据: {len(all_conj)} 个动词 (其中不规则 {irregular_count} 个)")

# 输出为JS文件
js_lines = []
js_lines.append('// 自动生成的变位数据（规则变位 + 不规则动词）')
js_lines.append(f'// 共 {len(all_conj)} 个动词, {len(TENSES_LIST)} 个时态')
js_lines.append('export const ALL_VERBS = {')

TENSES_LIST = ['presente', 'perfeito', 'imperfeito', 'futuro', 'conj_presente', 'condicional']

for v, conj in sorted(all_conj.items()):
    cn = verbs.get(v, '')
    # 转义单引号
    cn_safe = cn.replace("'", "\\'")
    js_lines.append(f"  '{v}': {{ cn: '{cn_safe}', tenses: {{")
    for tense in TENSES_LIST:
        if tense in conj:
            forms = conj[tense]
            forms_str = ', '.join([f"'{f}'" for f in forms])
            js_lines.append(f"    {tense}: [{forms_str}],")
    js_lines.append('  }},')

js_lines.append('};')

output_path = r"C:\Users\joaow\Desktop\葡语！\v2\js\data\conj-data.js"
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(js_lines))

print(f"输出到: {output_path}")
print(f"文件大小: {os.path.getsize(output_path) / 1024:.0f} KB")
