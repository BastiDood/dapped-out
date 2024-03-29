= The Wald Distribution

To compute the reward function, we adapt the *Wald Distribution* so that its mode $bb("Mo")$ corresponds to the first participant's delay by default. We define the probability distribution function $f$ using the parameters $mu$ (mean) and $lambda$ (shape) as:

$
f(x) = sqrt(lambda / (tau x^3)) times exp(-(lambda(x - mu)^2) / (2x mu^2))
$

The closed formula for the mode $bb("Mo")$ of the Shifted Wald Distribution is given by:

$
bb("Mo") &= mu (sqrt(1 + ((3mu)/(2lambda))^2) - (3mu)/(2lambda)) \
bb("Mo")/mu &= sqrt(1 + ((3mu)/(2lambda))^2) - (3mu)/(2lambda) \
bb("Mo")/mu + (3mu)/(2lambda) &= sqrt(1 + ((3mu)/(2lambda))^2) \
(bb("Mo")/mu + (3mu)/(2lambda))^2 &= 1 + ((3mu)/(2lambda))^2 \
(bb("Mo")/mu)^2 + cancel(2) times bb("Mo")/cancel(mu) times (3cancel(mu))/(cancel(2)lambda) + ((3mu)/(2lambda))^2 &= 1 + ((3mu)/(2lambda))^2 \
(bb("Mo")/mu)^2 + (3bb("Mo"))/lambda + cancel(((3mu)/(2lambda))^2) &= 1 + cancel(((3mu)/(2lambda))^2) \
(bb("Mo")/mu)^2 + (3bb("Mo"))/lambda &= 1 \
(3bb("Mo"))/lambda &= 1 - (bb("Mo")/mu)^2 \
&= (1 + bb("Mo")/mu)(1 - bb("Mo")/mu) \
3bb("Mo") &= lambda(1 + bb("Mo")/mu)(1 - bb("Mo")/mu) \
lambda &= (3bb("Mo")) / ((1 + bb("Mo")/mu)(1 - bb("Mo")/mu))
$

Therefore, given a fixed mode $bb("Mo")$ and mean $mu$, we can obtain the shape $lambda$ of the Wald distribution.

#pagebreak()

= Hard-coding Values

Suppose that we require that the reward $f(bb("Mo"))$ be set to a particular value $V in bb(R)^+$. Moreover, suppose that we set $mu colon.eq bb("Mo") + sigma$ (i.e., the mean reaction time should be $sigma$ milliseconds after the mode $bb("Mo")$). _By which factor $A in bb(R)^+$ do we need to scale $f$ to accommodate this?_

First, we derive the shape $lambda$.

$
lambda colon.eq (3bb("Mo")) / ((1+bb("Mo")/(bb("Mo")+sigma))(1-bb("Mo")/(bb("Mo")+sigma)))
$

Solving for $A$,

$
V &= A f(bb("Mo")) \
&= A exp(-(lambda(bb("Mo")-mu)^2)/(2bb("Mo")mu^2)) sqrt(lambda/(tau bb("Mo")^3)) \
&= A exp(-((bb("Mo")-mu)^2 dot (3cancel(bb("Mo"))) / ((1+bb("Mo")/(bb("Mo")+sigma))(1-bb("Mo")/(bb("Mo")+sigma))))/(2cancel(bb("Mo"))mu^2)) sqrt(lambda/(tau bb("Mo")^3)) \
&= A exp(-(3(bb("Mo")-mu)^2)/(2mu^2(1+bb("Mo")/(bb("Mo")+sigma))(1-bb("Mo")/(bb("Mo")+sigma)))) sqrt(((3cancel(bb("Mo"))) / ((1+bb("Mo")/(bb("Mo")+sigma))(1-bb("Mo")/(bb("Mo")+sigma))))/(tau cancel(bb("Mo"))bb("Mo")^2)) \
&= A exp(-(3(bb("Mo")-mu)^2)/(2mu^2(1+bb("Mo")/(bb("Mo")+sigma))(1-bb("Mo")/(bb("Mo")+sigma)))) sqrt(3/(tau bb("Mo")^2(1+bb("Mo")/(bb("Mo")+sigma))(1-bb("Mo")/(bb("Mo")+sigma)))) \
&= A exp(-(3(cancel(bb("Mo"))-(cancel(bb("Mo"))+sigma))^2)/(2(bb("Mo")+sigma)^2(1+bb("Mo")/(bb("Mo")+sigma))(1-bb("Mo")/(bb("Mo")+sigma)))) sqrt(3/(tau bb("Mo")^2(1+bb("Mo")/(bb("Mo")+sigma))(1-bb("Mo")/(bb("Mo")+sigma)))) \
&= A exp(-(3(-sigma)^2)/(2(bb("Mo")+sigma)^2(1+bb("Mo")/(bb("Mo")+sigma))(1-bb("Mo")/(bb("Mo")+sigma)))) sqrt(3/(tau bb("Mo")^2(1+bb("Mo")/(bb("Mo")+sigma))(1-bb("Mo")/(bb("Mo")+sigma)))) \
&= A exp(-(3sigma^2)/(2(bb("Mo")+sigma)^2(1+bb("Mo")/(bb("Mo")+sigma))(1-bb("Mo")/(bb("Mo")+sigma)))) sqrt(3/(tau bb("Mo")^2(1+bb("Mo")/(bb("Mo")+sigma))(1-bb("Mo")/(bb("Mo")+sigma)))) \
&= A exp(-(3sigma^2)/(2mu^2(1+bb("Mo")/mu)(1-bb("Mo")/mu))) sqrt(3/(tau bb("Mo")^2(1+bb("Mo")/mu)(1-bb("Mo")/mu))) \
A &= (V exp((3sigma^2)/(2mu^2(1+bb("Mo")/mu)(1-bb("Mo")/mu)))) / sqrt(3/(tau bb("Mo")^2(1+bb("Mo")/mu)(1-bb("Mo")/mu)))
$
