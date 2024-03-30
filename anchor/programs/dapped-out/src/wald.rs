/// A cached calculator for the [Wald Distribution][wald].
/// [wald]: https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/05%3A_Special_Distributions/5.37%3A_The_Wald_Distribution
#[derive(Clone, Copy)]
pub struct Wald {
    /// The cached mean of the distribution.
    mean: f64,
    /// The precomputed ratio of the inner radical.
    sqrt_ratio: f64,
    /// The precomputed ratio of the inner exponential.
    exp_ratio: f64,
}

impl Wald {
    pub fn new(mode: f64, offset: f64) -> Self {
        let mean = mode + offset;
        let ratio = mode / mean;
        let denom = (1. + ratio) * (1. - ratio);

        let lambda = 3. * mode / denom;
        let sqrt_ratio = lambda / core::f64::consts::TAU;
        let exp_ratio = lambda / (2. * mean.powi(2));

        Self { mean, sqrt_ratio, exp_ratio }
    }

    pub fn sample(self, x: f64) -> f64 {
        let radical = self.sqrt_ratio / x.powi(3);
        let exponent = self.exp_ratio * (x - self.mean).powi(2) / x;
        radical.sqrt() / exponent.exp()
    }
}
