# 校正結果（自動產生）

| set | PASS | SUSPECT | FAIL |
|---|---|---|---|
| bad-root | 0 | 1 | 6 |
| bad-cave | 0 | 3 | 4 |
| good-freddy | 2 | 2 | 0 |
| good-A | 2 | 1 | 0 |
| probably-good-l2 | 38 | 5 | 1 |
| bad-l2 | 4 | 6 | 2 |

| 群組 | n | PASS | SUSPECT | FAIL |
|---|---|---|---|---|
| bad | 26 | 4 | 10 | 12 |
| good | 7 | 4 | 3 | 0 |
| probably-good | 44 | 38 | 5 | 1 |

## 逐則

```
FAIL    bad-root/飛機                                預期[fei1 ji1]  whisper:「七七十」0.0 | breeze:「七七」0.0
          whisper：預期 fei1，聽成 qi1（音節不同）；whisper：預期 ji1，聽成 shi2（音節不同）；whisper：多出音節 qi1；breeze：預期 fei1，聽成 qi1（音節不同）；breeze：預期 ji1，聽成 qi1（音節不同）
```
```
FAIL    bad-root/車子                                預期[che1 zi5]  whisper:「遲我」0.0 | breeze:「此我」0.0
          whisper：預期 che1，聽成 chi2（音節不同）；whisper：預期 zi5，聽成 wo3（音節不同）；breeze：預期 che1，聽成 ci3（音節不同）；breeze：預期 zi5，聽成 wo3（音節不同）；聲調：che1 F0 輪廓為「升」（Δ2.9st），與預期 1 聲不符
```
```
SUSPECT bad-root/獅子                                預期[shi1 zi5]  whisper:「十指」0.57 | breeze:「食指」0.57
          whisper：預期 shi1，聽成 shi2（聲調不同）；breeze：預期 shi1，聽成 shi2（聲調不同）；聲調：shi1 F0 輪廓為「升」（Δ5.7st），與預期 1 聲不符；ASR 結果介於可信與不可信之間
```
```
FAIL    bad-root/熱狗                                預期[re4 gou3]  whisper:「拿勾」0.2 | breeze:「Now go.」0.0
          whisper：預期 re4，聽成 na2（音節不同）；whisper：預期 gou3，聽成 gou1（聲調不同）；breeze：預期 re4，聽成 （沒聽到）（音節不同）；breeze：預期 gou3，聽成 （沒聽到）（音節不同）；聲調：re4 F0 輪廓為「升」（Δ4.8st），與預期 4 聲不符
```
```
FAIL    bad-root/傘                                 預期[san3]  whisper:「看」0.0 | breeze:「看」0.0
          whisper：預期 san3，聽成 kan4（音節不同）；breeze：預期 san3，聽成 kan4（音節不同）
```
```
FAIL    bad-root/雨傘                                預期[yu3 san3]  whisper:「遇看」0.2 | breeze:「預看」0.2
          whisper：預期 yu3，聽成 yu4（聲調不同）；whisper：預期 san3，聽成 kan4（音節不同）；breeze：預期 yu3，聽成 yu4（聲調不同）；breeze：預期 san3，聽成 kan4（音節不同）
```
```
FAIL    bad-root/燈                                 預期[deng1]  whisper:「done」0.0 | breeze:「Done.」0.0
          whisper：預期 deng1，聽成 （沒聽到）（音節不同）；breeze：預期 deng1，聽成 （沒聽到）（音節不同）；聲調：deng1 F0 輪廓為「升」（Δ4.2st），與預期 1 聲不符
```
```
FAIL    bad-cave/飛機                                預期[fei1 ji1]  whisper:「七七十」0.0 | breeze:「七七」0.0
          whisper：預期 fei1，聽成 qi1（音節不同）；whisper：預期 ji1，聽成 shi2（音節不同）；whisper：多出音節 qi1；breeze：預期 fei1，聽成 qi1（音節不同）；breeze：預期 ji1，聽成 qi1（音節不同）
```
```
FAIL    bad-cave/車子                                預期[che1 zi5]  whisper:「慈我」0.0 | breeze:「此我」0.0
          whisper：預期 che1，聽成 ci2（音節不同）；whisper：預期 zi5，聽成 wo3（音節不同）；breeze：預期 che1，聽成 ci3（音節不同）；breeze：預期 zi5，聽成 wo3（音節不同）；聲調：che1 F0 輪廓為「升」（Δ2.8st），與預期 1 聲不符
```
```
SUSPECT bad-cave/獅子                                預期[shi1 zi5]  whisper:「十指」0.57 | breeze:「辭職」0.38
          whisper：預期 shi1，聽成 shi2（聲調不同）；breeze：預期 shi1，聽成 ci2（音節不同）；聲調：shi1 F0 輪廓為「升」（Δ5.3st），與預期 1 聲不符
```
```
SUSPECT bad-cave/熱狗                                預期[re4 gou3]  whisper:「拿狗」0.5 | breeze:「拿狗」0.5
          whisper：預期 re4，聽成 na2（音節不同）；breeze：預期 re4，聽成 na2（音節不同）；聲調：re4 F0 輪廓為「升」（Δ4.5st），與預期 4 聲不符；ASR 結果介於可信與不可信之間
```
```
FAIL    bad-cave/傘                                 預期[san3]  whisper:「看 看」0.0 | breeze:「看」0.0
          whisper：預期 san3，聽成 kan4（音節不同）；whisper：多出音節 kan4；breeze：預期 san3，聽成 kan4（音節不同）
```
```
SUSPECT bad-cave/雨傘                                預期[yu3 san3]  whisper:「與看」0.5 | breeze:「雨看」0.5
          whisper：預期 san3，聽成 kan4（音節不同）；breeze：預期 san3，聽成 kan4（音節不同）；ASR 結果介於可信與不可信之間
```
```
FAIL    bad-cave/燈                                 預期[deng1]  whisper:「Done」0.0 | breeze:「Done」0.0
          whisper：預期 deng1，聽成 （沒聽到）（音節不同）；breeze：預期 deng1，聽成 （沒聽到）（音節不同）；聲調：deng1 F0 輪廓為「升」（Δ3.9st），與預期 1 聲不符
```
```
PASS    good-freddy/燈                              預期[deng1]  whisper:「登」1.0 | breeze:「登」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
SUSPECT good-freddy/熱狗                             預期[re4 gou3]  whisper:「樂果」0.38 | breeze:「樂果」0.38
          whisper：預期 gou3，聽成 guo3（音節不同）；breeze：預期 gou3，聽成 guo3（音節不同）
```
```
PASS    good-freddy/雨傘                             預期[yu3 san3]  whisper:「雨傘」1.0 | breeze:「雨傘」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
SUSPECT good-freddy/傘                              預期[san3]  whisper:「散」0.4 | breeze:「3」0.4
          whisper：預期 san3，聽成 san4（聲調不同）；breeze：預期 san3，聽成 san1（聲調不同）
```
```
PASS    good-A/飛機                                  預期[fei1 ji1]  whisper:「飞机」1.0 | breeze:「飛機」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
PASS    good-A/車子                                  預期[che1 zi5]  whisper:「车子」1.0 | breeze:「車子」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
SUSPECT good-A/獅子                                  預期[shi1 zi5]  whisper:「吃字」0.5 | breeze:「十字」0.7
          whisper：預期 shi1，聽成 chi1（音節不同）；breeze：預期 shi1，聽成 shi2（聲調不同）；ASR 結果介於可信與不可信之間
```
```
PASS    prob-good/1-五指山                            預期[wu3 zhi3 shan1]  whisper:「五指山」1.0 | breeze:「五指山」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/2-點一點發亮的五指山                      預期[dian3 yi1 dian3 fa1 liang4 de5 wu3 zhi3 shan1]  whisper:「点一点发亮的五指山」1.0 | breeze:「點一點發亮的五指山」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/3-點一點，我們一起來學注音                   預期[dian3 yi1 dian3 wo3 men5 yi4 qi3 lai2 xue2 zhu4 yin1]  whisper:「點一點,我們一起來學注音」1.0 | breeze:「點一點 가서我們一起來學注音」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/4-想再學一次，還是去打妖怪？                  預期[xiang3 zai4 xue2 yi1 ci4 hai2 shi4 qu4 da3 yao1 guai4]  whisper:「想再學一次 還是去打妖怪」1.0 | breeze:「想再學一次還是去打妖怪」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/5-你看，悟空怎麼了呀？                     預期[ni3 kan4 wu4 kong1 zen3 me5 le5 ya5]  whisper:「你看 悟空怎麼了呀」1.0 | breeze:「你看 悟空怎麼了呀」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/6-佛祖壓住悟空，悟空想吃葡萄。                 預期[fo2 zu3 ya1 zhu4 wu4 kong1 wu4 kong1 xiang3 chi1 pu2 tao2]  whisper:「佛祖壓住悟空 悟空想吃葡萄」1.0 | breeze:「佛祖壓住悟空悟空想吃葡萄」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/7-悟空                             預期[wu4 kong1]  whisper:「悟空」1.0 | breeze:「悟空」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
PASS    prob-good/8-大山                             預期[da4 shan1]  whisper:「大山」1.0 | breeze:「大山」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
PASS    prob-good/9-葡萄                             預期[pu2 tao2]  whisper:「葡萄」1.0 | breeze:「葡萄」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
PASS    prob-good/10-找一找，佛祖在哪裡？                    預期[zhao3 yi1 zhao3 fo2 zu3 zai4 na3 li3]  whisper:「找一找佛祖在哪里?」1.0 | breeze:「找一找佛祖在哪裡」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/11-葡萄在哪裡？                        預期[pu2 tao2 zai4 na3 li3]  whisper:「葡萄在哪里?」1.0 | breeze:「葡萄在哪裡」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/12-佛祖                            預期[fo2 zu3]  whisper:「佛祖」1.0 | breeze:「佛祖」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
PASS    prob-good/13-佛祖的佛                          預期[fo2 zu3 de5 fu2]  whisper:「佛祖的佛」1.0 | breeze:「佛祖的佛」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/14-葡萄的葡                          預期[pu2 tao2 de5 pu2]  whisper:「葡萄的葡」1.0 | breeze:「葡萄的葡」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/15-點一點每個符號，聽它的聲音                 預期[dian3 yi1 dian3 mei3 ge4 fu2 hao4 ting1 ta1 de5 sheng1 yin1]  whisper:「点一点每个符号,听它的声音。」1.0 | breeze:「點一點每個符號聽它的聲音」1.0
          兩家 ASR 音節＋聲調吻合
```
```
SKIP    skip/16-ㄚ                                  預期[]  
          注音單音（教育部錄音），ASR 無法判讀，略過
```
```
SKIP    skip/17-ㄛ                                  預期[]  
          注音單音（教育部錄音），ASR 無法判讀，略過
```
```
SKIP    skip/18-ㄆ                                  預期[]  
          注音單音（教育部錄音），ASR 無法判讀，略過
```
```
SKIP    skip/19-ㄈ                                  預期[]  
          注音單音（教育部錄音），ASR 無法判讀，略過
```
```
SKIP    skip/20-ㄅ                                  預期[]  
          注音單音（教育部錄音），ASR 無法判讀，略過
```
```
SUSPECT prob-good/21-阿公                            預期[a1 gong1]  whisper:「阿公」1.0 | breeze:「阿公」1.0
          聲調：a1 F0 輪廓為「升」（Δ3.0st），與預期 1 聲不符
```
```
FAIL    bad-l2/22-喔喔                               預期[wo1 wo1]  whisper:「啊啊」0.0 | breeze:「Oh」0.2
          whisper：預期 wo1，聽成 a5（音節不同）；whisper：預期 wo1，聽成 a5（音節不同）；breeze：預期 wo1，聽成 （沒聽到）（音節不同）；breeze：預期 wo1，聽成 o2（聲調不同）
```
```
PASS    prob-good/23-盤子                            預期[pan2 zi5]  whisper:「盘子」1.0 | breeze:「盤子」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
FAIL    bad-l2/24-飛機                               預期[fei1 ji1]  whisper:「七七十」0.0 | breeze:「七七」0.0
          whisper：預期 fei1，聽成 qi1（音節不同）；whisper：預期 ji1，聽成 shi2（音節不同）；whisper：多出音節 qi1；breeze：預期 fei1，聽成 qi1（音節不同）；breeze：預期 ji1，聽成 qi1（音節不同）
```
```
PASS    prob-good/25-螃蟹                            預期[pang2 xie4]  whisper:「螃蟹」1.0 | breeze:「螃蟹」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
PASS    prob-good/26-房子                            預期[fang2 zi5]  whisper:「房子」1.0 | breeze:「房子」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
SUSPECT bad-l2/27-ㄅ只有一個小勾勾，ㄆ下面有兩隻交叉的腳。             預期[ㄅ zhi3 you3 yi1 ge4 xiao3 gou1 gou1 ㄆ xia4 mian4 you3 liang3 zhi1 jiao1 cha1 de5 jiao3]  whisper:「波只有一個小溝溝,波下面有兩隻交叉的角。」0.94 | breeze:「波只有一個小勾勾坡下面有兩隻交叉的角」1.0
          whisper：預期 ㄆ，聽成 bo1（音節不同）；有一家 ASR 把注音符號聽成別的音（見上）
```
```
PASS    bad-l2/28-哪個是爬的ㄆ？                          預期[na3 ge4 shi4 pa2 de5 ㄆ]  whisper:「哪个是爬的坡?」1.0 | breeze:「哪個是爬的坡」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    bad-l2/29-再看看，ㄆ有交叉的腳喔                      預期[zai4 kan4 kan4 ㄆ you3 jiao1 cha1 de5 jiao3 o1]  whisper:「再看看 颇有交叉的角哦」0.94 | breeze:「再看看坡有交叉的角喔」1.0
          whisper：預期 o1，聽成 o2（聲調不同）
```
```
PASS    prob-good/30-把兩張卡拖在一起，或是先點左邊，再點右邊          預期[ba3 liang3 zhang1 ka3 tuo1 zai4 yi4 qi3 huo4 shi4 xian1 dian3 zuo3 bian1 zai4 dian3 you4 bian1]  whisper:「把兩張卡拖在一起或是先點左邊再點右邊」1.0 | breeze:「把兩張卡托在一起或是先點左邊再點右邊」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/31-再點右邊這一張                       預期[zai4 dian3 you4 bian1 zhe4 yi1 zhang1]  whisper:「再點右邊這一張」1.0 | breeze:「再點右邊這一張」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/32-爬                             預期[pa2]  whisper:「爬」1.0 | breeze:「爬」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
FAIL    prob-good/34-佛                             預期[fu2]  whisper:「说」0.0 | breeze:「說」0.0
          whisper：預期 fu2，聽成 shuo1（音節不同）；breeze：預期 fu2，聽成 shuo1（音節不同）；聲調：fu2 F0 輪廓為「平」（Δ-1.2st），與預期 2 聲不符
```
```
PASS    bad-l2/35-八                                預期[ba1]  whisper:「8」1.0 | breeze:「eight」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
SUSPECT prob-good/36-婆                             預期[po2]  whisper:「婆」1.0 | breeze:「婆婆」0.5
          breeze：多出音節 po2；聲調：po2 F0 輪廓為「平」（Δ-0.4st），與預期 2 聲不符；ASR 結果介於可信與不可信之間
```
```
SUSPECT prob-good/37-媽                             預期[ma1]  whisper:「马」0.4 | breeze:「馬」0.4
          whisper：預期 ma1，聽成 ma3（聲調不同）；breeze：預期 ma1，聽成 ma3（聲調不同）
```
```
SUSPECT bad-l2/38-ㄚㄚㄚ，阿公笑哈哈                        預期[ㄚ ㄚ ㄚ a1 gong1 xiao4 ha1 ha1]  whisper:「啊...啊...啊...啊...啊...啊...啊...啊...啊...啊...…」0.21 | breeze:「阿公笑哈哈」0.62
          whisper：逐字稿疑似重複幻覺（已截斷）；whisper：預期 gong1，聽成 a5（音節不同）；whisper：預期 xiao4，聽成 a5（音節不同）；whisper：預期 ha1，聽成 a5（音節不同）；whisper：預期 ha1，聽成 a5（音節不同）；whisper：多出音節 a5 a5 a5 a5 a5 a5 a5 a5 a5 a5 a5；breeze：預期 ㄚ，聽成 （沒聽到）（音節不同）；breeze：預期 ㄚ，聽成 （沒聽到）（音節不同）；breeze：預期 ㄚ，聽成 （沒聽到）（音節不同）
```
```
SUSPECT bad-l2/39-ㄛㄛㄛ，公雞喔喔叫                        預期[ㄛ ㄛ ㄛ gong1 ji1 wo1 wo1 jiao4]  whisper:「哦,哦,哦,哦,哦,哦,哦,哦,哦,哦,哦,哦,哦,哦,哦,哦,哦,哦,哦,哦,…」0.2 | breeze:「Oh 公雞 o o 叫」0.5
          whisper：逐字稿疑似重複幻覺（已截斷）；whisper：預期 gong1，聽成 o2（音節不同）；whisper：預期 ji1，聽成 o2（音節不同）；whisper：預期 wo1，聽成 o2（聲調不同）；whisper：預期 wo1，聽成 o2（聲調不同）；whisper：預期 jiao4，聽成 o2（音節不同）；whisper：多出音節 o2 o2 o2 o2 o2 o2 o2 o2 o2 o2 o2；breeze：預期 ㄛ，聽成 （沒聽到）（音節不同）；breeze：預期 ㄛ，聽成 （沒聽到）（音節不同）；breeze：預期 wo1，聽成 （沒聽到）（音節不同）；breeze：預期 wo1，聽成 （沒聽到）（音節不同）
```
```
SUSPECT bad-l2/40-ㄆㄆㄆ，葡萄一串串                        預期[ㄆ ㄆ ㄆ pu2 tao2 yi1 chuan4 chuan4]  whisper:「坡 坡 坡 葡萄一串串」1.0 | breeze:「波波葡萄一串串」0.62
          breeze：預期 ㄆ，聽成 （沒聽到）（音節不同）；breeze：預期 ㄆ，聽成 bo1（音節不同）；breeze：預期 ㄆ，聽成 bo1（音節不同）；ASR 結果介於可信與不可信之間
```
```
SUSPECT bad-l2/41-ㄈㄈㄈ，飛機飛高高                        預期[ㄈ ㄈ ㄈ fei1 ji1 fei1 gao1 gao1]  whisper:「佛飞机飞高高」0.75 | breeze:「佛佛飛機飛高高」0.88
          whisper：預期 ㄈ，聽成 （沒聽到）（音節不同）；whisper：預期 ㄈ，聽成 （沒聽到）（音節不同）；breeze：預期 ㄈ，聽成 （沒聽到）（音節不同）；ASR 結果介於可信與不可信之間
```
```
SUSPECT prob-good/42-教學完成了，你好棒！                    預期[jiao4 xue2 wan2 cheng2 le5 ni3 hao3 bang4]  whisper:「教学完成了,你好棒」1.0 | breeze:「好險有錢了 你好棒」0.5
          breeze：預期 jiao4，聽成 hao3（音節不同）；breeze：預期 xue2，聽成 xian3（音節不同）；breeze：預期 wan2，聽成 you3（音節不同）；breeze：預期 cheng2，聽成 qian2（音節不同）；ASR 結果介於可信與不可信之間
```
```
PASS    prob-good/43-要繼續去打妖怪，還是下次再來？               預期[yao4 ji4 xu4 qu4 da3 yao1 guai4 hai2 shi4 xia4 ci4 zai4 lai2]  whisper:「要继续去打妖怪,还是下次再来」1.0 | breeze:「要繼續去打妖怪還是下次再來」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/44-我是五指山的岩岩！悟空想出來？先陪我玩注音遊戲！      預期[wo3 shi4 wu3 zhi3 shan1 de5 yan2 yan2 wu4 kong1 xiang3 chu1 lai2 xian1 pei2 wo3 wan2 zhu4 yin1 you2 xi4]  whisper:「我是五指山的妍妍悟空想出來先陪我玩注音遊戲」1.0 | breeze:「我是吳芷珊的 получилось悟空想出來先陪我玩助音遊戲」0.9
          breeze：預期 yan2，聽成 （沒聽到）（音節不同）；breeze：預期 yan2，聽成 （沒聽到）（音節不同）
```
```
PASS    prob-good/45-哪一個是                          預期[na3 yi1 ge4 shi4]  whisper:「哪一個是」1.0 | breeze:「哪一個是」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/46-是什麼開頭的音？                      預期[shi4 shen2 me5 kai1 tou2 de5 yin1]  whisper:「是什麼開頭的音?」1.0 | breeze:「是什麼開頭的音」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/47-哪一個是飛機的                       預期[na3 yi1 ge4 shi4 fei1 ji1 de5]  whisper:「哪一个是飞机的?」1.0 | breeze:「哪一個是飛機的」1.0
          兩家 ASR 音節＋聲調吻合
```
```
SUSPECT bad-l2/48-拼起來是什麼？                          預期[pin1 qi3 lai2 shi4 shen2 me5]  whisper:「平起來是什麼?」0.88 | breeze:「平起來是什麼」0.88
          whisper：預期 pin1，聽成 ping2（聲調不同）；breeze：預期 pin1，聽成 ping2（聲調不同）；兩家 ASR 在同一音節都聽成不同音／不同調：pin1
```
```
PASS    bad-l2/49-要怎麼拼？                            預期[yao4 zen3 me5 pin1]  whisper:「要怎麼拼」1.0 | breeze:「要怎麼拼」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/50-差一點點！再聽一次                     預期[cha4 yi1 dian3 dian3 zai4 ting1 yi1 ci4]  whisper:「差一点点再听一次」1.0 | breeze:「差一點點再聽一次」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/51-看！發光的那個就是答案喔                  預期[kan4 fa1 guang1 de5 na4 ge4 jiu4 shi4 da2 an4 o1]  whisper:「看 發光的那個就是答案喔」1.0 | breeze:「看 發光的那個就是答案喔」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/52-好棒！                           預期[hao3 bang4]  whisper:「好棒」1.0 | breeze:「好棒」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
PASS    prob-good/53-答對了！                          預期[da2 dui4 le5]  whisper:「答对了」1.0 | breeze:「答對了」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/54-你好厲害！                         預期[ni3 hao3 li4 hai4]  whisper:「你好厉害!」1.0 | breeze:「你好厲害」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/55-哇，好多個悟空！山都搖起來了！好啦好啦，我認輸了！     預期[wa5 hao3 duo1 ge4 wu4 kong1 shan1 dou1 yao2 qi3 lai2 le5 hao3 la5 hao3 la5 wo3 ren4 shu1 le5]  whisper:「哇!好多個悟空!山都搖起來了!好啦好啦,我認輸了」1.0 | breeze:「哇好多個悟空山都搖起來了好啦好啦我認輸了」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/56-分身們，出來吧！                      預期[fen1 shen1 men5 chu1 lai2 ba5]  whisper:「粉身們,出來吧!」0.9 | breeze:「分身們 出來吧」1.0
          whisper：預期 fen1，聽成 fen3（聲調不同）
```
```
PASS    prob-good/57-看我的金箍棒！                       預期[kan4 wo3 de5 jin1 gu1 bang4]  whisper:「看我的金箍棒」1.0 | breeze:「看我的金箍棒」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/58-悟空，師父來救你了。                    預期[wu4 kong1 shi1 fu4 lai2 jiu4 ni3 le5]  whisper:「悟空,师父来救你了」1.0 | breeze:「悟空 師父來救你了」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/59-我把山上的符咒揭開。                    預期[wo3 ba3 shan1 shang4 de5 fu2 zhou4 jie1 kai1]  whisper:「我把山上的符咒揭开」1.0 | breeze:「我把山上的符咒揭開」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/60-師父！我出來了！                      預期[shi1 fu4 wo3 chu1 lai2 le5]  whisper:「师傅,我出来了!」1.0 | breeze:「師傅 我出來了」1.0
          兩家 ASR 音節＋聲調吻合
```
```
PASS    prob-good/61-五指山過關！                        預期[wu3 zhi3 shan1 guo4 guan1]  whisper:「五指山过关」1.0 | breeze:「五指山過關」1.0
          兩家 ASR 音節＋聲調吻合
```
```
SUSPECT prob-good/65-喔喔叫                           預期[wo1 wo1 jiao4]  whisper:「哦哦叫」0.6 | breeze:「oh oh 叫」0.6
          whisper：預期 wo1，聽成 o2（聲調不同）；whisper：預期 wo1，聽成 o2（聲調不同）；breeze：預期 wo1，聽成 o2（聲調不同）；breeze：預期 wo1，聽成 o2（聲調不同）；ASR 結果介於可信與不可信之間
```